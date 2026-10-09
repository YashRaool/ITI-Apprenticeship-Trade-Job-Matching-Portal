import * as tradeSkillRepository from "../repositories/tradeSkillRepository";

export async function getGroupedTradeSkills() {
  const skills = await tradeSkillRepository.findAllTradeSkills();
  
  // Group by category
  const grouped = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) {
      acc[skill.category] = [];
    }
    acc[skill.category].push(skill);
    return acc;
  }, {} as Record<string, typeof skills>);
  
  return grouped;
}
