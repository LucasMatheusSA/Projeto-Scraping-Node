// npm init -y 
// npm install i cheerio request

const cheerio = require('cheerio');
const request = require('request');
const readline = require('readline');
const LINK_UNICAP = 'http://www.unicap.br/PortalGraduacao/'; 

request(LINK_UNICAP,function(erro,response,html){
    if(!erro && response.statusCode == 200){
        const telaLogin = cheerio.load(html);
        var linkTelaLogin = telaLogin('form').attr('action');
        var object = {
            'rotina': 1,
            'Matricula': 201610774, // Digitar matricula aqui
            'Digito': 1, // Digitar digito da maticula aqui
            'Senha': 426531, // Digitar senha aqui 
        }
        

        request.post(LINK_UNICAP + linkTelaLogin ,{form:object},function(erro,response,html){

            if(!erro && response.statusCode == 200){

                const telaLogin = cheerio.load(html);
                var linkTelaNotas = telaLogin('form').attr('action');

                request.post(LINK_UNICAP + linkTelaNotas , {form:{'rotina':23}},function(erro,response,html){

                    if(!erro && response.statusCode == 200){
                        var object = {
                            matricula:'',
                            nome:'',
                            curso:'',
                            notaGeral:'',
                            notaPeriodo:'',
                            disciplinas:[],
                        }
                        var table = [];
                        const telaNotas = cheerio.load(html);
                        console.log(html);

                        aux = telaNotas('tr').text(); aux = aux.replace(/\n|\t|\r/gi,'');

                        object.matricula = aux.substring(aux.indexOf("Matrícula") + 9,aux.indexOf("Nome")).trim(); // pegar matricula
                        object.nome = aux.substring(aux.indexOf("Nome") + 4,aux.indexOf("Curso")).trim(); // pegar nome
                        object.curso = aux.substring(aux.indexOf("Curso") + 5,aux.indexOf("Curso",aux.indexOf("Curso") + 5)).trim(); // pegar curso
                        object.notaGeral = aux.substring(aux.indexOf("Curso",aux.indexOf("Curso") + 5) + 5,aux.indexOf("Último")).trim(); // pegar nota geral
                        object.notaPeriodo = aux.substring(aux.indexOf("Período") + 7,aux.indexOf("Disciplina")).trim(); // pegar nome
                        
                        console.log("matricula: "+ object.matricula);
                        console.log("nome:"+ object.nome);
                        console.log("curso:"+ object.curso);
                        console.log("nota1:"+ object.notaGeral);
                        console.log("nota2:"+ object.notaPeriodo);

                        var novo;
                        novo = telaNotas('.tab-main').find('table').toArray().reverse();
                        
                        
                        console.log(novo);

                        // aux = aux.substring(aux.indexOf("Situação Final") + 14,aux.length);
                        // aux = aux.split(' ');
                        // aux.forEach((el,i)=>{
                        //     if(el != ''){table.push(el)}
                        // })
                        console.log(table);

                    }else{
                        console.log("Erro acesso tela de Notas");
                    }
                })
            }else{
                console.log("Erro acesso tela de Home");
            }
        })
    }else{
        console.log("Erro acesso tela de Login");
    }
})

