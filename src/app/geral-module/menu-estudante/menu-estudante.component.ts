import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/login-module/login.service';

@Component({
  selector: 'app-menu-estudante',
  templateUrl: './menu-estudante.component.html',
  styleUrls: ['./menu-estudante.component.css'],
})
export class MenuEstudanteComponent implements OnInit {
  private usuario;
  private estudanteTurma;
  turmaId;

  items: MenuItem[];
  constructor(private router: Router, private login: LoginService) {
    this.usuario = login.getUsuarioLogado();
  }

  ngOnInit() {
    /*EstudanteTurma.getAll(new Query("estudanteId", "==", this.usuario.pk())).subscribe(resultado => {
      this.turmaId = resultado[0].turmaId;
    });*/

    this.items = [
      {
        label: 'Planejamentos',
        command: () => {
          this.router.navigate(['main', { outlets: { principal: ['listagem-planejamento'] } }]);
        },
        id: 'planejamentoMenu',
      },
      {
        label: 'Minha turma',
        command: () => {
          this.router.navigate(['main', { outlets: { principal: ['minha-turma'] } }]);
        },
      },
      {
        label: 'Meu desempenho',
        command: () => {
          this.router.navigate(['main', { outlets: { principal: ['meu-desempenho'] } }]);
        },
        id: 'meuDesempenhoMenu',
      },
      {
        label: 'Sair',
        command: () => {
          this.logout();
        },
        id: 'sairMenu',
      },
    ];
  }

  logout() {
    if (this.login.logout()) {
      return this.router.navigate(['']);
    }
  }
}
