// npm init -y 
// npm install i cheerio request

// npm init -y 
// npm install i cheerio request

const cheerio = require('cheerio');
const request = require('request');
const fs = require('fs');

const file = 'Relatorio.txt';
const LINK_UNICAP = 'http://www.unicap.br/PortalGraduacao/'; 

const notas = [];
const dados = [];
const object = {
    'rotina': 1,
    'Matricula': "", 
    'Digito': "", 
    'Senha': "", 
}
const dataFile = getLogin();

function getLogin(){
    var dataFile = fs.readFileSync(file,'utf8');
    object.Matricula = dataFile.substring(dataFile.indexOf('Matricula:') + 10, dataFile.indexOf('Digito:')).trim();
    object.Digito = dataFile.substring(dataFile.indexOf('Digito:') + 7, dataFile.indexOf('Senha:')).trim();
    object.Senha = dataFile.substring(dataFile.indexOf('Senha:') + 6, dataFile.indexOf('===============================================================================')).trim();
    return dataFile;
}

function printNotas(notas){
    var returnNotas = "\n==========> (" + notas[0] + ") - " + notas[1] + "\n" +
    "1° GQ      2° GQ       Média       Final       Média da Cadeira\n " + 
    notas[3].replace(" ","") + "        " + 
    notas[4].replace(" ","") + "          " + 
    notas[5].replace(" ","") + "          " + 
    notas[6].replace(" ","") + "               " + 
    notas[7].replace(" ","") + "\n\n" ;

    if (notas[4].replace(" ","") == "--" && notas[3].replace(" ","") != "--") {
        if ((parseFloat(notas[3].replace(" ","")) * 2) < 5) {
            var ppassar = (15 - (parseFloat(notas[3].replace(" ","")) * 2)) / 3;
            returnNotas = returnNotas + "Nota para ir pra final (2GQ) - " + ppassar.toFixed(2) + "\n\n";
        } else {
            ppassar = (35 - (parseFloat(notas[3].replace(" ","")) * 2)) / 3;
            returnNotas = returnNotas + "Nota para passar direto (2GQ) - " + ppassar.toFixed(2) + "\n\n";
        }
    } else if(notas[3].replace(" ","") != "--" && notas[4].replace(" ","") != "--"){
        var media = ((parseFloat(notas[3].replace(" ","")) * 2) + (parseFloat(notas[4].replace(" ","")) * 3)) / 5;
        if (parseFloat(media) < 3) {
            returnNotas = returnNotas + "Você Reprovou :(\n\n"
        } else
        if (parseFloat(media) < 7) {
            var ppassar = 10 - parseFloat(media);
            returnNotas = returnNotas + "Nota para passar (Final) - " + ppassar.toFixed(2) + "\n\n";
        } else {
            returnNotas = returnNotas + "Parabéns você passou com nota (Média) - " + media.toFixed(2) + "\n\n";
        }
    }

    return returnNotas;
}


request(LINK_UNICAP,function(erro,response,html){
    if(!erro && response.statusCode == 200){
        const telaLogin = cheerio.load(html);
        var linkTelaLogin = telaLogin('form').attr('action');
        

        request.post(LINK_UNICAP + linkTelaLogin ,{form:object},function(erro,response,html){

            if(!erro && response.statusCode == 200){

                const telaLogin = cheerio.load(html);
                var linkTelaNotas = telaLogin('form').attr('action');

                request.post(LINK_UNICAP + linkTelaNotas , {form:{'rotina':23}},function(erro,response,html){

                    var data = new Date();

                    var dia     = data.getDate();           // 1-31
                    var mes     = data.getMonth();          // 0-11 (zero=janeiro)
                    var ano    = data.getFullYear();       // 4 dígitos
                    var hora    = data.getHours();          // 0-23
                    var min     = data.getMinutes();        // 0-59

                    var str_data = dia + '/' + (mes+1) + '/' + ano;
                    var str_hora = hora + ':' + min ;


                    if(!erro && response.statusCode == 200){
                        const telaNotas = cheerio.load(html);

                        telaNotas('td').each((i,el)=>{
                            if(i < 5){
                                dados.push(telaNotas(el).html());
                            }else{
                                if(telaNotas(el).html().indexOf("&#xA0;") == -1){
                                    notas.push(telaNotas(el).html());
                                }
                            }
                        })

                        var relatorio = "";
                        for(i=0 ; i < notas.length ; i = i + 8){
                            relatorio = relatorio + printNotas([notas[i],notas[i+1],notas[i+2],notas[i+3],notas[i+4],notas[i+5],notas[i+6],notas[i+7]]);
                        }

                        var allDataFile = 
                        "============================== DIGITE OS VALORES ==============================\n"+
                        "                                                                               \n"+
                        "Matricula:              Digito:              Senha:             \n"+
                        "                                                                               \n"+
                        "===============================================================================\n" + 
                        "\n===============================================================================" +
                        "\n                        RELATORIO "+ str_data + " ("+str_hora + ")                " +
                        "\n===============================================================================\n\n" +
                        "==========  " + dados[2] + "  ========== \n" + 
                        "---> " + dados[1] + " (" + dados[0] + ")\n\n" +
                        " ========================                    ============================== \n" + 
                        "|  Média do curso: "+ dados[3] +"  |                  |  Média ultimo periodo: "+ dados[4] +"  |\n" +
                        " ========================                    ============================== \n\n" +
                        "\n===============================================================================\n\n" +
                        relatorio;

                        fs.writeFile('Relatorio.txt',allDataFile,{enconding:'utf-8',flag: 'w'}, function (err) {
                            if (err) throw err;
                            console.log('Relatorio gerado!');
                        });

                        

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

