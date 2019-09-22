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
        console.log(linkTelaLogin);
        

        request.post(LINK_UNICAP + linkTelaLogin ,{form:object},function(erro,response,html){

            if(!erro && response.statusCode == 200){

                const telaLogin = cheerio.load(html);
                var linkTelaNotas = telaLogin('form').attr('action');
                console.log(linkTelaNotas);

                request.post(LINK_UNICAP + linkTelaNotas , {form:{'rotina':23}},function(erro,response,html){

                    if(!erro && response.statusCode == 200){
                        const telaNotas = cheerio.load(html);
                        table = telaNotas('tr').text();
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

