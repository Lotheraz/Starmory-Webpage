export const RockTypesEnum = {
  Quantainium: "Quantainium",
  Bexalite: "Bexalite",
  Taranite: "Taranite",
  Gold: "Gold",
  Diamond: "Diamond",
  Borase: "Borase",
  Laranite: "Laranite",
  Beryl: "Beryl",
  Hepaestanite: "Hepaestanite",
  Agricium: "Agricium",
  Titanium: "Titanium",
  Tungsten: "Tungsten",
  Quartz: "Quartz",
  Copper: "Copper",
  Iron: "Iron",
  Corundum: "Corundum",
  Aluminium: "Aluminium",
};
// Values of the type of mineral per SCU
export const rockValues = {
  [RockTypesEnum.Quantainium]: 23748,
  [RockTypesEnum.Bexalite]: 7981,
  [RockTypesEnum.Taranite]: 7686,
  [RockTypesEnum.Gold]: 7484,
  [RockTypesEnum.Diamond]: 6846,
  [RockTypesEnum.Borase]: 3532,
  [RockTypesEnum.Laranite]: 2887,
  [RockTypesEnum.Beryl]: 2710,
  [RockTypesEnum.Hepaestanite]: 2666,
  [RockTypesEnum.Agricium]: 2579,
  [RockTypesEnum.Titanium]: 502,
  [RockTypesEnum.Tungsten]: 425,
  [RockTypesEnum.Quartz]: 412,
  [RockTypesEnum.Copper]: 384,
  [RockTypesEnum.Iron]: 401,
  [RockTypesEnum.Corundum]: 135,
  [RockTypesEnum.Aluminium]: 317,
};

export const SCU_TO_MASS_FACTOR = 682.25;

export const calculateMassValue = (oreMasses, workOrderFee) => {
  let total = 0;

  for (let oreTypeKey in RockTypesEnum) {
    const oreName = RockTypesEnum[oreTypeKey];
    if (oreMasses[oreName] > 0 && rockValues[oreName]) {
      const scuEquivalent = oreMasses[oreName] / SCU_TO_MASS_FACTOR;
      const oreValue = scuEquivalent * rockValues[oreName];
      total += oreValue;
    }
  }

  const totalMassValue = Math.round(total);
  const netMassValue = Math.round(total - (parseFloat(workOrderFee) || 0));

  return { totalMassValue, netMassValue };
};

export const calculateScuValue = (scuInput, scuPurity, selectedRockType) => {
  if (!scuInput || !scuPurity || !selectedRockType) {
    return 0;
  }

  const rockValue = rockValues[selectedRockType] || 0;
  return Math.round(scuInput * rockValue * (scuPurity / 100));
};
