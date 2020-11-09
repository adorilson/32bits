import ArrayUtilities from 'src/app/util/arrayUtilities';
import { Collection, Document } from '../firestore/document';
import { OrientacaoParson } from './enum/orientacaoParson';
import Questao from './questao';
import SegmentoParson from './segmentoParson';
import { RespostaQuestaoParson } from '../juiz/respostaQuestaoParson';

export default class QuestaoParsonProblem extends Questao {
  constructor(
    id,
    enunciado,
    nomeCurto,
    sequencia,
    dificuldade,
    respostaCorreta,
    public segmentos: any /* As opções de segmentos disponíveis para utilizar. É um array */,
    public algoritmoInicial: any /* Um algoritmo que pode vir junto com a questão formado por segmentos. */,
    public sequenciaCorreta: any /* Um array de inteiros indicando a sequência correta esparada para o Parson */,
    public orientacao: OrientacaoParson = OrientacaoParson.vertical
  ) {
    super(id, enunciado, nomeCurto, sequencia, dificuldade, respostaCorreta);
  }

  /**
   * Constrói objetos a partir do atributo array de uma document
   * @param questoesFechadas
   */
  static construir(questoes: any[]) {
    const objetos: QuestaoParsonProblem[] = [];

    if (questoes != null) {
      questoes.forEach((questao) => {
        objetos.push(
          new QuestaoParsonProblem(
            questao.id,
            questao.enunciado,
            questao.nomeCurto,
            questao.sequencia,
            questao.dificuldade,
            questao.segmentos,
            questao.algoritmoInicial,
            questao.sequenciaCorreta,
            questao.orientacao
          )
        );
      });
    }

    return objetos;
  }

  objectToDocument() {
    const document = super.objectToDocument();

    if (Array.isArray(this.segmentos)) {
      document['segmentos'] = this.segmentos.map((segmento) => {
        return { id: segmento.id, conteudo: segmento.conteudo, sequencia: segmento.sequencia };
      });
    }

    if (Array.isArray(this.algoritmoInicial)) {
      document['algoritmoInicial'] = this.algoritmoInicial.map((segmento) => {
        return { id: segmento.id, conteudo: segmento.conteudo, sequencia: segmento.sequencia };
      });
    }

    document['sequenciaCorreta'] = this.sequenciaCorreta;
    document['orientacao'] = this.orientacao;

    return document;
  }

  isSequenciaCorreta(resposta: RespostaQuestaoParson) {
    const sequenciaAlgoritmo = [];
    if (Array.isArray(resposta.algoritmo)) {
      resposta.algoritmo.forEach((segmento) => {
        sequenciaAlgoritmo.push(segmento.sequencia.toString());
      });

      return ArrayUtilities.equals(sequenciaAlgoritmo, this.sequenciaCorreta);
    }

    return false;
  }

  validar() {
    if (
      Array.isArray(this.segmentos) &&
      this.segmentos.length > 0 &&
      Array.isArray(this.sequenciaCorreta) &&
      this.sequenciaCorreta.length > 0
    ) {
      return true && super.validar();
    }
    return false && super.validar();
  }

  prepararParaSave() {
    if (typeof this.algoritmoInicial === 'string') {
      this.algoritmoInicial = this.algoritmoInicial.split('\n');
    }

    if (typeof this.segmentos === 'string') {
      this.segmentos = this.segmentos.split('\n');
    }

    if (typeof this.sequenciaCorreta === 'string') {
      this.sequenciaCorreta = this.sequenciaCorreta.split('\n');
    }

    let contadorSegmentos = 1;
    this.segmentos = this.segmentos.map((segmento) => {
      segmento = new SegmentoParson(null, segmento, contadorSegmentos);
      contadorSegmentos += 1;
      return segmento;
    });

    let contadorAlgoritmoInicial = 1;
    this.algoritmoInicial = this.algoritmoInicial.map((algoritmo) => {
      algoritmo = new SegmentoParson(null, algoritmo, contadorAlgoritmoInicial);
      contadorAlgoritmoInicial += 1;
      return algoritmo;
    });
  }

  prepararParaCarregamento() {
    /*  if (this.algoritmoInicial != null) {
      this.algoritmoInicial = this.algoritmoInicial.join('\n');
    }

    if (this.segmentos != null) {
      this.segmentos = this.segmentos.join('\n');
    }

    if (this.sequenciaCorreta != null) {
      this.sequenciaCorreta = this.sequenciaCorreta.join('\n');
    } */
  }
}