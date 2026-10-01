import { router, json, error, requireAuth, db } from '@appdeploy/sdk';

type TransactionType = 'income' | 'expense';

type CategoryRecord = {
    type: TransactionType;
    name: string;
    emoji: string;
    color: string;
    created_at: number;
};

type TransactionRecord = {
    type: TransactionType;
    amount: number;
    categoryId: string;
    description: string;
    date: string;
    paymentMethod: string;
};

const LIST_LIMIT = 1000;

const DEFAULT_CATEGORIES: Array<Pick<CategoryRecord, 'type' | 'name' | 'emoji' | 'color'>> = [
    { type: 'expense', name: 'אוכל', emoji: '🍽️', color: 'peach' },
    { type: 'expense', name: 'תחבורה', emoji: '🚌', color: 'blue' },
    { type: 'expense', name: 'קניות', emoji: '🛍️', color: 'pink' },
    { type: 'expense', name: 'בילויים', emoji: '🎉', color: 'lavender' },
    { type: 'expense', name: 'אחר', emoji: '🏷️', color: 'gray' },
    { type: 'income', name: 'משכורת', emoji: '💰', color: 'sage' },
    { type: 'income', name: 'מתנות', emoji: '🎁', color: 'yellow' },
];

const categoriesTable = (userId: string) => `categories:${userId}`;
const transactionsTable = (userId: string) => `transactions:${userId}`;
const metaTable = (userId: string) => `meta:${userId}`;

async function listCategories(userId: string) {
    const { items } = await db.list<CategoryRecord>(categoriesTable(userId), { limit: LIST_LIMIT });
    return items.sort((a, b) => (a.created_at ?? 0) - (b.created_at ?? 0));
}

async function ensureDefaultCategories(userId: string) {
    const { items: meta } = await db.list(metaTable(userId), { limit: 1 });
    if (meta.length > 0) {
        return;
    }
    const now = Date.now();
    await db.add(
        categoriesTable(userId),
        DEFAULT_CATEGORIES.map((c, i) => ({ ...c, created_at: now + i }))
    );
    await db.add(metaTable(userId), [{ seeded: true }]);
}

async function listTransactions(userId: string) {
    const { items } = await db.list<TransactionRecord>(transactionsTable(userId), {
        limit: LIST_LIMIT,
    });
    return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export const handler = router({
    'GET /api/_healthcheck': [async () => json({ message: 'Success' })],

    'GET /api/categories': [
        requireAuth(),
        async ctx => {
            const userId = ctx.user!.userId;
            await ensureDefaultCategories(userId);
            return json(await listCategories(userId));
        },
    ],

    'POST /api/categories': [
        requireAuth(),
        async ctx => {
            const userId = ctx.user!.userId;
            const body = (ctx.body || {}) as Partial<CategoryRecord>;
            const name = (body.name ?? '').trim();
            if (!name) {
                return error('יש להזין שם לקטגוריה', 400);
            }
            if (body.type !== 'income' && body.type !== 'expense') {
                return error('סוג קטגוריה לא תקין', 400);
            }
            const existing = await listCategories(userId);
            if (existing.some(c => c.type === body.type && c.name === name)) {
                return error(`כבר קיימת קטגוריה בשם "${name}"`, 409);
            }
            const record: CategoryRecord = {
                type: body.type,
                name,
                emoji: body.emoji || '🏷️',
                color: body.color || 'sage',
                created_at: Date.now(),
            };
            const [id] = await db.add(categoriesTable(userId), [record]);
            if (!id) {
                return error('לא ניתן היה ליצור את הקטגוריה', 500);
            }
            return json({ id, ...record });
        },
    ],

    'PUT /api/categories/:id': [
        requireAuth(),
        async ctx => {
            const userId = ctx.user!.userId;
            const [current] = await db.get<CategoryRecord>(categoriesTable(userId), [ctx.params.id]);
            if (!current) {
                return error('קטגוריה לא נמצאה', 404);
            }
            const changes = (ctx.body || {}) as Partial<CategoryRecord>;
            const next: CategoryRecord = { ...current };
            if (typeof changes.name === 'string') {
                const name = changes.name.trim();
                if (!name) {
                    return error('יש להזין שם לקטגוריה', 400);
                }
                const existing = await listCategories(userId);
                if (existing.some(c => c.id !== ctx.params.id && c.type === current.type && c.name === name)) {
                    return error(`כבר קיימת קטגוריה בשם "${name}"`, 409);
                }
                next.name = name;
            }
            if (typeof changes.emoji === 'string') {
                next.emoji = changes.emoji;
            }
            if (typeof changes.color === 'string') {
                next.color = changes.color;
            }
            const [ok] = await db.update(categoriesTable(userId), [{ id: ctx.params.id, record: next }]);
            if (!ok) {
                return error('לא ניתן היה לעדכן את הקטגוריה', 500);
            }
            return json({ id: ctx.params.id, ...next });
        },
    ],

    'POST /api/categories/:id/delete': [
        requireAuth(),
        async ctx => {
            const userId = ctx.user!.userId;
            const { reassignToId } = (ctx.body || {}) as { reassignToId?: string };
            const transactions = await listTransactions(userId);
            const affected = transactions.filter(t => t.categoryId === ctx.params.id);
            if (affected.length > 0) {
                if (!reassignToId || reassignToId === ctx.params.id) {
                    return error('יש להעביר את התנועות לקטגוריה אחרת', 400);
                }
                for (let i = 0; i < affected.length; i += 100) {
                    const chunk = affected.slice(i, i + 100);
                    await db.update(
                        transactionsTable(userId),
                        chunk.map(({ id, ...record }) => ({
                            id,
                            record: { ...record, categoryId: reassignToId },
                        }))
                    );
                }
            }
            await db.delete(categoriesTable(userId), [ctx.params.id]);
            return json({ ok: true });
        },
    ],

    'GET /api/transactions': [
        requireAuth(),
        async ctx => json(await listTransactions(ctx.user!.userId)),
    ],

    'POST /api/transactions': [
        requireAuth(),
        async ctx => {
            const userId = ctx.user!.userId;
            const body = (ctx.body || {}) as Partial<TransactionRecord>;
            if (
                (body.type !== 'income' && body.type !== 'expense') ||
                typeof body.amount !== 'number' ||
                !(body.amount > 0) ||
                !body.categoryId ||
                !body.date
            ) {
                return error('נתוני תנועה לא תקינים', 400);
            }
            const record: TransactionRecord = {
                type: body.type,
                amount: body.amount,
                categoryId: body.categoryId,
                description: body.description ?? '',
                date: body.date,
                paymentMethod: body.paymentMethod ?? 'my-card',
            };
            const [id] = await db.add(transactionsTable(userId), [record]);
            if (!id) {
                return error('לא ניתן היה לשמור את התנועה', 500);
            }
            return json({ id, ...record });
        },
    ],

    'DELETE /api/transactions/:id': [
        requireAuth(),
        async ctx => {
            await db.delete(transactionsTable(ctx.user!.userId), [ctx.params.id]);
            return json({ ok: true });
        },
    ],
});
