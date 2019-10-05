import { Component, OnInit } from '@angular/core';
import { UsuarioService } from '../usuario.service';
import Usuario from '../../model/usuario';
import { Router } from '@angular/router';
import { LoginService } from 'src/app/login-module/login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  usuario:Usuario;

  constructor(private loginService:UsuarioService, private router:Router, private login:LoginService, private messageService:MessageService) { 
    this.usuario = new Usuario(null, null, null, 0);
  }

  ngOnInit() {
  }

  acessar(){
    if(this.login.validarLogin(this.usuario)){
      let t = this;
      this.login.logar(this.usuario).subscribe(resultado=>{
        if(resultado)
          this.router.navigateByUrl("/main");
        else{
          this.messageService.add({severity:'warn', summary:'Falha ao entrar', detail: "a senha ="+this.usuario.senha +" e login = "+this.usuario.email+" estão invalidos"});

        }
      })
    }
  }

  cadastrar(){
    this.router.navigate(["cadastro-estudante"])
  }

}
