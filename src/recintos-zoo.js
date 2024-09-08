import { animais } from "./animais";
import { recintos } from "./recintos";

class RecintosZoo {
  analisaRecintos(especie, quantidade) {
    const lancarErro = new GeradorDeMensagenDeErro();
    if (!especie || !especie.trim()) {
      return lancarErro.lancarMensagemDeErro("Animal inválido");
    }

    if (typeof quantidade !== "number" || quantidade <= 0) {
      return lancarErro.lancarMensagemDeErro("Quantidade inválida");
    }
    const verificadorDeAnimais = new VerificadorDeAnimais();
    const animalExiste = verificadorDeAnimais.analisarAnimal(especie);

    if (!animalExiste) {
      return lancarErro.lancarMensagemDeErro("Animal inválido");
    }
    const verificadorDeRecintos = new VerificadorDeRecintos();
    const recintosEncontrado = verificadorDeRecintos.espacosEmRecintos(
      animalExiste.tamanho,
      quantidade,
      animalExiste.biomas
    );

    if (!recintosEncontrado.length) {
      return lancarErro.lancarMensagemDeErro("Não há recinto viável");
    }

    const interacaoDosAnimais = verificadorDeRecintos.especiesPorRecinto(
      animalExiste,
      recintosEncontrado
    );

    if (!interacaoDosAnimais.length) {
      return lancarErro.lancarMensagemDeErro("Não há recinto viável");
    }
    const recintosOrdenados =
      new OrdenadorDeRecintos().ordenarRecintosPorEspacoLivre(
        interacaoDosAnimais
      );

    const recintosViaveis = new FormatadorDeRecintos().formatarRecintos(
      recintosOrdenados
    );

    return {
      recintosViaveis,
    };
  }
}

class VerificadorDeAnimais {
  //verifica se o animal existe
  analisarAnimal(especie) {
    const existeAnimal = animais.find((item) => item.especie === especie);
    return existeAnimal || null;
  }
}

class VerificadorDeRecintos {
  espacosEmRecintos(tamanhoAnimal, quantidade, biomas) {
    const todosRecintosEncontrados = [];
    const espacoOcupadoPelaEspecie = tamanhoAnimal * quantidade;

    for (const bioma of biomas) {
      for (const recinto of recintos) {
        // verifica se o recinto tem o bioma
        if (recinto.biomas.includes(bioma)) {
          // verifica se o espaço total do recinto é menor que o espaco ocupado pela especie
          if (recinto.tamanhoTotal < espacoOcupadoPelaEspecie) continue;
          let quantidadeSobrandoAposAdicionar = 0;
          // verifica se o recinto tem animais
          const quantidadeDeAnimais = recinto.animais.length;
          if (quantidadeDeAnimais) {
            // conta o espaco sobrando no recinto
            let espacoSobrandoNoRecinto = 0;
            recinto.animais.forEach((animal) => {
              const espacoOcupadoNoRecinto = animal.tamanho * animal.quantidade;
              espacoSobrandoNoRecinto +=
                recinto.tamanhoTotal - espacoOcupadoNoRecinto;
            });
            // verifica se o espaco sobrando no recinto é menor que o espaco ocupado pela especie
            if (espacoSobrandoNoRecinto < espacoOcupadoPelaEspecie) continue;
            quantidadeSobrandoAposAdicionar =
              espacoSobrandoNoRecinto - espacoOcupadoPelaEspecie;
          } else {
            quantidadeSobrandoAposAdicionar =
              recinto.tamanhoTotal - espacoOcupadoPelaEspecie;
          }
          //   adiconar recinto em todosRecintosComBioma
          todosRecintosEncontrados.push({
            ...recinto,
            espacoLivre: quantidadeSobrandoAposAdicionar,
          });
        }
      }
    }

    return todosRecintosEncontrados;
  }

  especiesPorRecinto(animal, recintos) {
    let todosRecintosVerificados = [];
    for (const recinto of recintos) {
      let espacoLivre = recinto.espacoLivre;
      let podeAdicionar = true;
      for (const item of recinto.animais) {
        // verifica se as especies são diferentes
        if (item.especie !== animal.especie) {
          // não permite que um hipopotamo interaja com outro animal que não  seja no rio e savana
          if (
            animal.especie === "HIPOPOTAMO" ||
            item.especie === "HIPOPOTAMO"
          ) {
            const eSavanaOuRio =
              recinto.biomas.includes("savana") &&
              recinto.biomas.includes("rio");
            if (!eSavanaOuRio) {
              podeAdicionar = false;
              break;
            }
          }

          if (item.carnivero !== animal.carnivero) {
            podeAdicionar = false;
            break;
          }
          espacoLivre--;
        }
      }

      if (podeAdicionar) {
        todosRecintosVerificados.push({
          ...recinto,
          espacoLivre,
        });
      }
    }

    return todosRecintosVerificados;
  }
}

class OrdenadorDeRecintos {
  ordenarRecintosPorEspacoLivre(recintos) {
    return recintos.sort((a, b) => {
      if (a.espacoLivre < b.espacoLivre) return 1;
      if (a.espacoLivre > b.espacoLivre) return -1;
      return 0;
    });
  }
}

class FormatadorDeRecintos {
  formatarRecintos(recintos) {
    return recintos.map((recinto) => {
      return `Recinto ${recinto.numero} (espaço livre: ${recinto.espacoLivre} total: ${recinto.tamanhoTotal})`;
    });
  }
}

class GeradorDeMensagenDeErro {
  lancarMensagemDeErro(erro) {
    return { erro };
  }
}

export { RecintosZoo as RecintosZoo };
