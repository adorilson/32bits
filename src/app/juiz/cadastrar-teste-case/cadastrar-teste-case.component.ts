import { Component, OnInit, Input } from '@angular/core';
import TestCase from 'src/app/model/testCase';
import { TestesCasesService } from '../testes-cases.service';
import { MenuItem, MessageService } from 'primeng/api';

@Component({
  selector: 'app-cadastrar-teste-case',
  templateUrl: './cadastrar-teste-case.component.html',
  styleUrls: ['./cadastrar-teste-case.component.css']
})
export class CadastrarTesteCaseComponent implements OnInit {
  @Input("testCase")

  testeCase: TestCase;
  entrada: string;
  selectedEntrada: String;
  selectedTest: TestCase;
  items: MenuItem[];

  constructor(private messageService: MessageService) { }



  ngOnInit() {
    this.items = [

      { label: 'Apagar', icon: 'pi pi-times', command: (event) => this.retirarTestCase(this.selectedEntrada) }
    ];
  }

  adicionarEntrada() {

    if (this.testeCase.validarEntrada(this.entrada)) {
      this.testeCase.entradas.push(this.entrada);
      this.entrada = null;
      this.messageEntradaAdicionada();

    } else {
      this.messageEntradaVazia();
     

    }
  }

  retirarTestCase(entrada: String) {

    let index = -1;
    for (let i = 0; i < this.testeCase.entradas.length; i++) {
      if (this.testeCase.entradas[i] == entrada) {
        index = i;
        break;
      }
    }
    this.testeCase.entradas.splice(index, 1);
    this.messageEntradaRetirada();
  }


  messageCadastrado() {
    this.messageService.add({ severity: 'success', summary: "Test Case cadastrado", detail: "Esse test Case foi incluído na questão" });
  }

  messageError() {
    this.messageService.add({ severity: 'error', summary: "teste Case inválido", detail: "Esse teste Case não foi cadastrado" });
  }

  messageEntradaVazia() {
    this.messageService.add({ severity: 'info', summary: "Entrada negada", detail: "ops... a entrada não pode estar vazia" });
  }

  messageEntradaRetirada() {
    this.messageService.add({ severity: 'info', summary: "teste Case modificado", detail: "Entrada retirada" });
  }
  messageEntradaAdicionada() {
    this.messageService.add({ severity: 'success', summary: "teste Case modificado", detail: "Entrada adicionada" });
  }
}
