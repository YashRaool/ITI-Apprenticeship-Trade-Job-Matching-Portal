const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.appSetting.upsert({
  where: { key: 'maxTradeSkillsPerStudent' },
  update: {},
  create: { key: 'maxTradeSkillsPerStudent', value: '5' }
}).then(() => {
  console.log('Seeded default setting: maxTradeSkillsPerStudent = 5');
  return p.$disconnect();
}).catch(e => { console.error(e); process.exit(1); });
