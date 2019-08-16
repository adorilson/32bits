import { Component, OnInit } from '@angular/core';
import Turma from 'src/app/model/turma';

import { MenuItem, MessageService } from 'primeng/api';
import { Router, ActivatedRoute } from '@angular/router';
import Usuario from 'src/app/model/usuario';
import { LoginService } from '../login.service';

@Component({
  selector: 'app-cadastrar-turma',
  templateUrl: './cadastrar-turma.component.html',
  styleUrls: ['./cadastrar-turma.component.css']
})
export class CadastrarTurmaComponent implements OnInit {


  turma;
  turmas: Turma[];
  estudantes;
  selectedEstudante: Usuario;
  items: MenuItem[];
  professor;
  professores: Usuario [];
  selectedProfessor: Usuario;
  usuario;



  constructor(public router: Router, private messageService: MessageService, private route: ActivatedRoute,private login:LoginService) {
    
  }

  ngOnInit() {
    this.turma = new Turma(null, null, [], null);
    this.professor = new Usuario(null,null,null,null);
    this.usuario = [];
    this.estudantes = [];
  this.items = [
    { label: 'Vizualizar', icon: 'pi pi-search', command: (event) => this.vizualizarProf(this.selectedProfessor) },
    { label: 'Deletar', icon: 'pi pi-times', command: (event) => this.deleteProf(this.selectedProfessor) },

  ];

  }

  
  searchP(event) {
    Usuario.getAll().subscribe(professores => {this.professores = [];
      professores.forEach(professor => {
      professores.filter(professor =>{ professor.perfil == 2
      if (professor.email != undefined && typeof professor.email === "string") {
        if (professor.email.includes(event.query)) {
          this.professores.push(professor);
      }
    }
    });
    });
    return this.professores;
    });
  }
   cadastradocomSucesso() {
    this.messageService.add({ severity: 'success', summary: 'Service Message', detail: 'Salvo com sucesso' });
  }
  erro() {
    this.messageService.add({ severity: 'erro', summary: 'Service Message', detail: 'Salvo com sucesso' });
  }
 
  menssagemErro(){
    this.messageService.add({ severity: 'erro', summary: 'Service Message', detail: 'e-mail já adicionado' });
  }

  

  vizualizarProf(professor : Usuario) {
    this.messageService.add({ severity: 'info', summary: 'Professor selecionado', detail: professor.nome + ' - ' + professor.email });

  }

  
  adicionarProfessor() {
    this.turma.professor = this.professor;
  }
  addElemento(){
    this.usuario.push(this.professor.email);
  }


  deleteProf(professor: Usuario) {
    this.turma.professor == null;
    for (var i =0; i < this.usuario.length; i++){
      if (this.usuario[i].email == professor.email){
        this.usuario.splice(i,1);
      }
    }

  }


  
  cadastrarTurma() {
    if (this.turma) {
      this.turma.save().subscribe(resultado => {
        this.router.navigate(["main", { outlets: { principal: ['listagem-turma'] } }]);


      },
        err => {
          this.erro();
        });

    }

  }


}