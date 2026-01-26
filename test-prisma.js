const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        console.log('Testing category creation with icon...');
        const category = await prisma.category.create({
            data: {
                name: 'Test Category',
                icon: 'Tag',
                type: 'EXPENSE'
            }
        });
        console.log('Category created:', category);
    } catch (error) {
        console.error('Error creating category:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
