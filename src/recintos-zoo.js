import { Animals } from "./animais";
import { Enclosures } from "./recintos";

class RecintosZoo {
  analisaRecintos(specie, quantity) {
    try {
      const animalValidator = new AnimalValidator(Animals);
      const animal = animalValidator.validate(specie);
      new QuantityValidator(quantity);

      const enclosuresValidator = new EnclosuresValidator(Enclosures);
      const filterEnclosureQuantity = enclosuresValidator.validate(animal, quantity);

      const rousingRulesEnclosure = new RousingRulesEnclosure(filterEnclosureQuantity);
      const enclosures = rousingRulesEnclosure.exec(animal);

      return { recintosViaveis: FormatEnclosure.format(enclosures) };
    } catch (error) {
      return { erro: error.message };
    }
  }
}

class AnimalValidator {
  constructor(animals) {
    this.animals = animals;
  }

  validate(specie) {
    this.specieValidate(specie);
    const hasAnimal = this.animals.find((animal) => animal.specie === specie);
    if (!hasAnimal) {
      throw new Error("Animal inválido");
    }
    return hasAnimal;
  }

  specieValidate(specie) {
    if (!specie) {
      throw new Error("Animal inválido");
    }
  }
}

class QuantityValidator {
  constructor(quantity) {
    this.quantityValidate(quantity);
    this.quantity = quantity;
  }

  quantityValidate(quantity) {
    if (!quantity || typeof quantity !== "number") {
      throw new Error("Quantidade inválida");
    }
  }
}

class EnclosuresValidator {
  constructor(enclosures = []) {
    this.enclosures = enclosures;
  }

  validate(animal, quantity) {
    const quantityTotalAnimalsInput = animal.length * quantity;
    const enclosures = [];
    this.enclosures.forEach((enclosure) => {
      let inhabitedSpace = enclosure.animals.reduce((acc, animal) => (acc += animal.quantity * animal.length), 0);
      const isBiome = enclosure.biomes.some((biome) => animal.biomes.includes(biome));
      const hasSpecieDifferent = this.hasSpecieDifferent(enclosure, animal);

      const spaceTotalWithNewAnimal = quantityTotalAnimalsInput + inhabitedSpace + hasSpecieDifferent;
      const hasSpaceInEnclosure = spaceTotalWithNewAnimal <= enclosure.lengthTotal;
      const spaceFree = enclosure.lengthTotal - spaceTotalWithNewAnimal;
      if (isBiome && hasSpaceInEnclosure) {
        enclosures.push({
          spaceFree,
          ...enclosure,
        });
      }
    });

    if (!enclosures.length) {
      throw new Error("Não há recinto viável");
    }
    return enclosures;
  }

  hasSpecieDifferent(enclosure, newAnimal) {
    const EXTRA_SPACE = 1;
    const existNewAnimalInEnclosure = enclosure.animals.find((animal) => animal.specie === newAnimal.specie);
    const quantityAnimaisInEnclosure = enclosure.animals.length;
    if (!existNewAnimalInEnclosure && quantityAnimaisInEnclosure !== 0) return EXTRA_SPACE;

    return 0;
  }
}

class RousingRulesEnclosure {
  constructor(enclosures) {
    this.enclosures = enclosures;
  }
  exec(animal) {
    const enclosures = this.enclosures.filter((enclosure) => {
      const hippoRules = this.hippoRules(enclosure, animal);
      const carnivoresRules = this.carnivoresRules(enclosure, animal);

      if (hippoRules !== false && carnivoresRules !== false) return enclosure;
    });

    if (!enclosures.length) {
      throw new Error("Não há recinto viável");
    }
    return enclosures;
  }

  hippoRules(enclosure, animal) {
    if (animal.specie === "HIPOPOTAMO" && enclosure.animals.length > 1) {
      if (!enclosure.biomes.includes("savana") || !enclosure.biomes.includes("rio")) {
        return false;
      }
    }
  }
  carnivoresRules(enclosure, newAnimal) {
    if (!newAnimal.carnivore) {
      if (enclosure.animals.some((animal) => animal.carnivore)) {
        return false;
      }
    }

    if (newAnimal.carnivore) {
      if (!enclosure.animals.every((animal) => animal.carnivore)) {
        return false;
      }
    }
  }
}

const FormatEnclosure = {
  format(enclosures = []) {
    return enclosures.map((enclosure) => {
      return `Recinto ${enclosure.number} (espaço livre: ${enclosure.spaceFree} total: ${enclosure.lengthTotal})`;
    });
  },
};

export { RecintosZoo as RecintosZoo };
