import { Document, Collection, ignore } from './firestore/document';
import { Observable, forkJoin } from 'rxjs';
import { QuestaoProgramacao } from './questoes/questaoProgramacao';
import Usuario from './usuario';
import Submissao from './submissao';
import { Util } from './util';
import { RespostaQuestaoFechada } from './respostaQuestaoFechada';
import { Assuntos } from './enums/assuntos';
import QuestaoFechada from './questoes/questaoFechada';
import QuestaoParsonProblem from './questoes/parsonProblem';
import Query from './firestore/query';
import { RespostaQuestaoParson } from './juiz/respostaQuestaoParson';
import QuestaoColaborativa from './cscl/questaoColaborativa';
import QuestaoProgramacaoCorrecao from './questoes/questaoProgramacaoCorrecao';
import RespostaQuestaoCorrecaoAlgoritmo from './correcao-algoritmo/correcaoAlgoritmo';
import { VisualizacaoRespostasQuestoes } from './visualizacaoRespostasQuestoes';

@Collection('assuntos')
export class Assunto extends Document {
  constructor(id, public nome) {
    super(id);
    this.questoesFechadas = [];
    this.questoesProgramacao = [];
    this.objetivosEducacionais = [];
    this.questoesParson = [];
    this.questoesColaborativas = [];
    this.questoesCorrecao = [];
  }

  sequencia;
  importancia;
  questoesProgramacao;
  questoesFechadas;
  questoesParson: any;
  questoesColaborativas;
  questoesCorrecao;
  objetivosEducacionais: [];
  isAtivo;

  @ignore()
  percentualConclusao;

  /**
   * Este método deve ser temporário, pois uma questão possui relação com assuntos,
   * mas está sendo utilizado relação com banco de dados (usando a PK deles)
   * No entanto, isso é custoso, pois seria preciso carregar do BD cada assunto.
   * Para reduzir esse problema, futuramente, deve-se refatorar cada questão de programação para usar o nome que está no enumerador.
   */
  static construir(assunto) {
    if (assunto != null) {
      const a = new Assunto(assunto, null);
      if (assunto == 'PU0EstYupXgDZ2a57X0X') {
        // Repetições
        a.nome = Assuntos.repeticoes;
      } else if (assunto == 'jW22yOF9a28N0aQlNNGR') {
        // Repetições
        a.nome = Assuntos.variaveis;
      } else if (assunto == 'x6cVrs1hHkKmdRhFBpsf') {
        // Repetições
        a.nome = Assuntos.condicoes;
      }

      return a;
    }

    return null;
  }

  static fromJson(assuntoJson) {
    let assunto = new Assunto(assuntoJson.id, assuntoJson.nome);
    assunto['questoesProgramacao'] = assuntoJson.questoesProgramacao;
    return assunto;
  }

  static getAll(query = null, orderBy = null): Observable<any[]> {
    return new Observable((observer) => {
      super.getAll(query).subscribe((assuntos) => {
        assuntos.sort((assuntoA, assuntoB) => {
          if (assuntoA.sequencia < assuntoB.sequencia) {
            return -1;
          } else if (assuntoA.sequencia > assuntoB.sequencia) {
            return 1;
          }
          return 0;
        });

        assuntos.forEach(assunto=>{
          Assunto.construirQuestoes(assunto);
        })

        observer.next(assuntos);
        observer.complete();
      });
    });
  }

  static getAllAdmin(query = null, orderBy = null): Observable<any[]> {
    return super.getAll(query);
  }

  static exportarParaJson() {
    return new Observable((observer) => {
      Assunto.getAllAdmin().subscribe((assuntos) => {
        let assuntosConvertidos = [];
        assuntos.forEach((assunto) => {
          assuntosConvertidos.push(assunto.toJson());
        });

        let saidaJson = JSON.stringify(assuntosConvertidos);
        observer.next(saidaJson);
        observer.complete();
      });
    });
  }

  static construirQuestoes(assunto){
    assunto['questoesProgramacao'] = QuestaoProgramacao.construir(
      assunto['questoesProgramacao'],
      assunto
    );
    assunto['questoesFechadas'] = QuestaoFechada.construir(assunto['questoesFechadas']);
    assunto['questoesColaborativas'] = QuestaoColaborativa.construir(
      assunto['questoesColaborativas'],
      assunto
    );
    assunto['questoesParson'] = QuestaoParsonProblem.construir(assunto['questoesParson']);
    assunto['questoesCorrecao'] = QuestaoProgramacaoCorrecao.construir(
      assunto['questoesCorrecao'],
      assunto
    );
  }

  static get(id): Observable<Assunto> {
    return new Observable<Assunto>((observer) => {
      super.get(id).subscribe(
        (assunto) => {
          assunto['questoesProgramacao'] = QuestaoProgramacao.construir(
            assunto['questoesProgramacao'],
            assunto
          );
          assunto['questoesFechadas'] = QuestaoFechada.construir(assunto['questoesFechadas']);
          assunto['questoesColaborativas'] = QuestaoColaborativa.construir(
            assunto['questoesColaborativas'],
            assunto
          );
          assunto['questoesParson'] = QuestaoParsonProblem.construir(assunto['questoesParson']);
          assunto['questoesCorrecao'] = QuestaoProgramacaoCorrecao.construir(
            assunto['questoesCorrecao'],
            assunto
          );
          observer.next(assunto as Assunto);
          observer.complete();
        },
        (err) => {
          observer.error(err);
        }
      );
    });
  }

  getQuestoesComStatusConclusao(estudante) {
    return new Observable((observer) => {
      let consultas = {};
      if (Array.isArray(this.questoesFechadas) && this.questoesFechadas.length > 0) {
        consultas['questoesFechadas'] = QuestaoFechada.verificarQuestoesRespondidas(
          estudante,
          this.questoesFechadas
        );
      }

      if (Array.isArray(this.questoesProgramacao) && this.questoesProgramacao.length > 0) {
        consultas['questoesProgramacao'] = QuestaoProgramacao.verificarQuestoesRespondidas(
          estudante,
          this.questoesProgramacao
        );
      }

      if (Array.isArray(this.questoesParson) && this.questoesParson.length > 0) {
        consultas['questoesParson'] = QuestaoParsonProblem.verificarQuestoesRespondidas(
          estudante,
          this.questoesParson
        );
      }

      if (Array.isArray(this.questoesCorrecao) && this.questoesCorrecao.length > 0) {
        consultas['questoesCorrecao'] = QuestaoProgramacaoCorrecao.verificarQuestoesRespondidas(
          estudante,
          this.questoesCorrecao
        );
      }

      forkJoin(consultas).subscribe((respostas) => {
        let questoes = [];
        if (respostas['questoesFechadas'] != null) {
          questoes = questoes.concat(respostas['questoesFechadas']);
        }

        if (respostas['questoesProgramacao'] != null) {
          questoes = questoes.concat(respostas['questoesProgramacao']);
        }

        if (respostas['questoesCorrecao'] != null) {
          questoes = questoes.concat(respostas['questoesCorrecao']);
        }

        if (respostas['questoesParson'] != null) {
          questoes = questoes.concat(respostas['questoesParson']);
        }

        questoes.sort((qA, qB) => {
          if (qA.sequencia < qB.sequencia) {
            return -1;
          } else if (qA.sequencia > qB.sequencia) {
            return 1;
          } else {
            return 0;
          }
        });

        observer.next(questoes);
        observer.complete();
      });
    });
  }

  static isQuestoesProgramacaoFinalizadas(assunto: Assunto, estudante, visualizacoesRespostasQuestoesProgramacao, margemAceitavel = 0.6) {
    return new Observable((observer) => {
      let percentual = this.calcularPercentualConclusaoQuestoesProgramacao(
        assunto,
        estudante,
        visualizacoesRespostasQuestoesProgramacao,
        margemAceitavel
      );
      if (percentual >= margemAceitavel) {
        observer.next(true);
        observer.complete();
      } else {
        observer.next(false);
        observer.complete();
      }
    });
  }

  static consultarRespostasEstudante(estudante: Usuario) {
    return new Observable<any>((observer) => {
      let query: any = {};
      query.submissoes = Submissao.getAll(new Query('estudanteId', '==', estudante.pk()));
      query.respostaQuestaoFechada = RespostaQuestaoFechada.getAll(
        new Query('estudanteId', '==', estudante.pk())
      );
      query.resposaQuestaoParson = RespostaQuestaoParson.getAll(
        new Query('estudanteId', '==', estudante.pk())
      );
      query.respostaQuestaoCorrecao = RespostaQuestaoCorrecaoAlgoritmo.getAll(
        new Query('estudanteId', '==', estudante.pk())
      );

      query.visualizacoesRespostasProgramacao = VisualizacaoRespostasQuestoes.getAll(new Query("estudanteId", "==", estudante.pk()));

      forkJoin(query).subscribe((respostas) => {
        observer.next(respostas);
        observer.complete();
      });
    });
  }

  static calcularProgresso(assunto: Assunto, respostas) {
    let percentualConclusao = 0;
    percentualConclusao += this.calcularPercentualConclusaoQuestoesFechadas(
      assunto,
      respostas.respostaQuestaoFechada
    );
    percentualConclusao += this.calcularPercentualConclusaoQuestoesParson(
      assunto,
      respostas.resposaQuestaoParson
    );
    percentualConclusao += this.calcularPercentualConclusaoQuestoesCorrecao(
      assunto,
      respostas.respostaQuestaoCorrecao
    );

    percentualConclusao += this.calcularPercentualConclusaoQuestoesProgramacao(
      assunto,
      Submissao.agruparPorQuestao(respostas.submissoes),
      respostas.visualizacoesRespostasProgramacao,
      0.5
    );



    return (percentualConclusao * 100)/4; // Divide por quatro, pois é o total de tipos de questões que existem, consequentemente de percentuais que são calculados para cada um.
  }

  static calcularProgressoGeral(assuntos: Assunto[], respostas) {
    let percentualConclusaoGeral = 0;
    if (!Util.isObjectEmpty(respostas)) {
      for (let i = 0; i < assuntos.length; i++) {
        percentualConclusaoGeral += this.calcularProgresso(assuntos[i], respostas);
      }
    }

    if(percentualConclusaoGeral > 0){
      percentualConclusaoGeral = percentualConclusaoGeral / assuntos.length;
      percentualConclusaoGeral = Math.round((percentualConclusaoGeral + Number.EPSILON) * 100) / 100;
    }

    return percentualConclusaoGeral;
  }

  /**
   * Recupera as submissões mais recentes do estudante. As submissões são referentes a diferentes questões de programação.
   * @param assunto
   * @param usuario
   */
  static getTodasSubmissoesProgramacaoPorEstudante(assunto, usuario) {
    const submissoes = {};
    assunto.questoesProgramacao.forEach((questao) => {
      if (questao.testsCases != undefined && questao.testsCases.length > 0) {
        submissoes[questao.id] = Submissao.getRecentePorQuestao(questao, usuario);
      }
    });

    return submissoes;
  }

  static consultarRespostasQuestoesFechadasPorAssunto(assunto: Assunto, estudante: Usuario) {
    // Recuperar todas as questões de um assunto
    return new Observable((observer) => {
      const respostas = [];
      assunto.questoesFechadas.forEach((questao) => {
        // Recuperar todas as respostas às questões fechadas

        respostas.push(RespostaQuestaoFechada.getRespostaQuestaoEstudante(questao, estudante));
      });

      if (respostas.length > 0 && assunto.questoesFechadas.length == respostas.length) {
        forkJoin(respostas).subscribe((respostas) => {});
      } else {
        observer.next(0);
        observer.complete();
      }
    });
  }

  static calcularPercentualConclusaoQuestoesFechadas(assunto: Assunto, respostasQuestoesFechadas) {
    let totalRespostas = 0;
    for (let i = 0; i < assunto.questoesFechadas.length; i++) {
      let resultado = false;
      for (let j = 0; j < respostasQuestoesFechadas.length; j++) {
        let questaoIdResposta = respostasQuestoesFechadas[j].questaoId;
        let questaoId = assunto.questoesFechadas[i].id
        if (questaoIdResposta == questaoId) {
          resultado = QuestaoFechada.isRespostaCorreta(
            assunto.questoesFechadas[i],
            respostasQuestoesFechadas[j]
          );
        }
      }

      if (resultado) {
        totalRespostas++;
      }
    }
    const percentual = totalRespostas / assunto.questoesFechadas.length;

    return percentual;
  }

  static calcularPercentualConclusaoQuestoesParson(assunto: Assunto, respostasQuestoesParson) {
    let totalRespostas = 0;
    for (let i = 0; i < assunto.questoesParson.length; i++) {
      let resultado = false;
      for (let j = 0; j < respostasQuestoesParson.length; j++) {
        if (respostasQuestoesParson[j].questaoId == assunto.questoesParson[i].id) {
          resultado = assunto.questoesParson[i].isRespostaCorreta(respostasQuestoesParson[j]);
        }
      }

      if (resultado) {
        totalRespostas++;
      }
    }
    const percentual = totalRespostas / assunto.questoesParson.length;

    return percentual;
  }

  static calcularPercentualConclusaoQuestoesCorrecao(assunto: Assunto, respostas) {
    let totalRespostas = 0;
    for (let i = 0; i < assunto.questoesCorrecao.length; i++) {
      let resultado = false;
      for (let j = 0; j < respostas.length; j++) {
        if (respostas[j].questaoCorrecaoId == assunto.questoesCorrecao[i].id) {
          resultado = assunto.questoesCorrecao[i].isRespostaCorreta(respostas[j]);

          if(resultado){
            break;
          }
        }
      }

      if (resultado) {
        totalRespostas++;
      }
    }

    if (assunto.questoesCorrecao.length > 0) {
      return totalRespostas / assunto.questoesCorrecao.length;
    }

    return 0;
  }

  /**
   * Calcula o percentual de questões de programação que o estudante resolveu.
   * @param assunto
   * @param usuario
   * @param margemAceitavel
   */
  static calcularPercentualConclusaoQuestoesProgramacao(
    assunto: Assunto,
    submissoes: Map<string, Submissao[]>,
    visualizacoesQuestoesProgramacao:any[],
    margemAceitavel
  ) {
    if (assunto != undefined && submissoes != undefined && submissoes.size > 0) {
      const totalQuestoes = assunto.questoesProgramacao.length;
      let questoesRespondidas = 0;
      assunto.questoesProgramacao.forEach((questao) => {
        let subsQuestao = submissoes.get(questao.id);
        let subRecente = Submissao.filtrarRecente(subsQuestao);
        let visualizouResposta = visualizacoesQuestoesProgramacao.findIndex((visualizacao)=>{
          if(visualizacao.questaoId == questao.id){
            return true;
          }

          return false;
        })
        if(visualizouResposta == -1){
          let resultado = questao.isFinalizada(subRecente, margemAceitavel);
          if (resultado) {
            questoesRespondidas += 1;
          }
        }
        
      });

      return questoesRespondidas / totalQuestoes;
    } else {
      return 0;
    }
  }

  /* Ordena os assuntos a partir da sequência em que devem ser trabalhados. */
  static ordenar(arrayAssuntos: Assunto[]) {
    arrayAssuntos.sort(function (assuntoA, assuntoB) {
      return assuntoA.sequencia - assuntoB.sequencia;
    });

    return arrayAssuntos;
  }

  definirSequenciaQuestoes(questoes: any[]) {
    // Definir a sequência a partir da posição no array
    for (let i = 0; i < questoes.length; i = i + 1) {
      if (
        questoes[i] instanceof QuestaoFechada ||
        questoes[i] instanceof QuestaoProgramacao ||
        questoes[i] instanceof QuestaoParsonProblem
      ) {
        if (questoes[i].sequencia != null) {
          questoes[i].sequencia = i + 1;
        }

        if (questoes[i].dificuldade === undefined) {
          questoes[i].dificuldade = 1;
        }
      }
    }

    const questoesFechadas = [];
    const questoesProgramacao = [];
    const questoesParson = [];

    questoes.forEach((questao) => {
      if (questao instanceof QuestaoFechada) {
        questoesFechadas.push(questao);
      } else if (questao instanceof QuestaoProgramacao) {
        questoesProgramacao.push(questao);
      } else if (questao instanceof QuestaoParsonProblem) {
        questoesParson.push(questao);
      }
    });

    this.questoesFechadas = questoesFechadas;
    this.questoesProgramacao = questoesProgramacao;
    this.questoesParson = questoesParson;
  }

  toJson() {
    let document = super.objectToDocument();
    document['questoesFechadas'] = this.questoesFechadas;
    document['questoesProgramacao'] = this.questoesProgramacao;
    document['questoesParson'] = this.questoesParson;
    document['questoesColaborativas'] = this.questoesColaborativas;

    return JSON.stringify(document);
  }

  getUltimaSequencia() {
    return (
      this.questoesFechadas.length +
      this.questoesProgramacao.length +
      this.questoesParson.length +
      1
    );
  }

  /* Retorna as questões de um assunto ordenadas por sua sequência. */
  ordenarQuestoes() {
    let questoes = new Array(
      this.questoesFechadas.length + this.questoesProgramacao.length + this.questoesParson.length
    );
    questoes = questoes.fill(0);

    this.questoesFechadas.forEach((questao) => {
      questoes[questao.sequencia - 1] = questao;
    });

    this.questoesProgramacao.forEach((questao) => {
      questoes[questao.sequencia - 1] = questao;
    });

    this.questoesParson.forEach((questao) => {
      questoes[questao.sequencia - 1] = questao;
    });

    return questoes;
  }

  /**
   * Retorna a próxima questão sabendo qual está atualmente.
   */
  proximaQuestao(questaoAtual) {
    let questoesOrdenadas = this.ordenarQuestoes();
    let proximaQuestao = questoesOrdenadas.filter(
      (questao) => questao.sequencia == questaoAtual.sequencia + 1
    );
    return proximaQuestao.length > 0 ? proximaQuestao[0] : null;
  }

  objectToDocument() {
    const document = super.objectToDocument();

    if (Array.isArray(this.questoesProgramacao) != null && this.questoesProgramacao.length > 0) {
      const questoes = [];
      this.questoesProgramacao.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoes.push(questao.objectToDocument());
        }
      });

      document['questoesProgramacao'] = questoes;
    }

    if (Array.isArray(this.questoesFechadas) != null && this.questoesFechadas.length > 0) {
      const questoesFechadas = [];
      this.questoesFechadas.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesFechadas.push(questao.objectToDocument());
        }
      });

      document['questoesFechadas'] = questoesFechadas;
    }

    if (Array.isArray(this.questoesParson) && this.questoesParson.length > 0) {
      const questoesParson = [];
      this.questoesParson.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesParson.push(questao.objectToDocument());
        }
      });

      document['questoesParson'] = questoesParson;
    }

    if (Array.isArray(this.questoesColaborativas) && this.questoesColaborativas.length > 0) {
      const questoesColaborativas = [];
      this.questoesColaborativas.forEach((questao) => {
        if (typeof questao.objectToDocument === 'function') {
          questoesColaborativas.push(questao.objectToDocument());
        }
      });

      document['questoesColaborativas'] = questoesColaborativas;
    }

    if (this.objetivosEducacionais.length > 0) {
      document['questoeobjetivosEducacionaisFechadas'] = this.objetivosEducacionais;
    }

    return document;
  }

  getQuestaoProgramacaoById(questaoId) {
    let questaoLocalizada = null;
    this.questoesProgramacao.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoColaborativaById(questaoId): QuestaoColaborativa | null {
    let questaoLocalizada = null;
    this.questoesColaborativas.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoFechadaById(questaoId) {
    let questaoLocalizada = null;
    this.questoesFechadas.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  getQuestaoParsonById(questaoId) {
    let questaoLocalizada = null;
    this.questoesParson.forEach((questao) => {
      if (questao.id == questaoId) {
        questaoLocalizada = questao;
      }
    });

    return questaoLocalizada;
  }

  validar() {
    if (this.nome == undefined || this.nome == null) {
      return false;
    }

    return true;
  }
}
