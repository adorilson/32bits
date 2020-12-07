import ConfiguracaoEditor from './configuracaoEditor';
import { QuestaoProgramacao } from './questoes/questaoProgramacao';
declare var monaco: any;
declare var editor: any;

declare function destacarLinha(linha, status): any;

export default class Editor {
  private constructor() {
    //this.editor = editor;
    this.codigo = '';
    this.configuracao = new ConfiguracaoEditor();
  }

  static instance;
  codigo;

  configuracao: ConfiguracaoEditor;

  static getInstance(): Editor {
    if (this.instance == null) {
      this.instance = new Editor();
    }

    return this.instance;
  }

  static getTipoExecucao(questao: QuestaoProgramacao) {
    if (questao.testsCases.length != 0) {
      return 'testes';
    } else {
      return 'execução';
    }
  }

  /* destacarLinha(linha, status) {
    if (linha != NaN && linha != undefined) {
      linha = parseInt(linha);
      if (linha > 0 && linha <= editor.getModel().getLineCount()) {
        const lineLength = editor.getModel().getLineLength(linha);
        this.decorations = [
          {
            range: new monaco.Range(linha, 1, linha, lineLength),
            options: {
              isWholeLine: true,
              className: 'erro',
            },
          },
        ];
        editor.deltaDecorations([], this.decorations);
      }
      //this.configuracao.decorations.push(editor.deltaDecorations([], ));
    }
  } */

  destacarErros(erro) {
    destacarLinha(erro.linha, 'erro');
  }
}
