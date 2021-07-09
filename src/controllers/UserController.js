class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate)
        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId)

        this.onSubmit();
        this.onEdit();
        this.selectAll();
    }

    onEdit() {
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e => {
            this.showPanelCreate()
        });

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();

            //obter o formulario
            let btn = this.formUpdateEl.querySelector("[type=submit]")
            btn.disabled = true

            //obter os valores
            let values = this.getValues(this.formUpdateEl)

            //posicao que da tabela q sera editada 
            // id do usuario
            let index = this.formUpdateEl.dataset.trIndex;

            //informando oa sistema qual o id da tebela
            let tr = this.tableEl.rows[index];

            // dados antigo (o original)
            let userOld = JSON.parse(tr.dataset.user);

            //Object.assign = copia o valor de atributo de um obj 
            // cria um obj destino, retornando este obj
            // todos que estao a direita sobre escreve o que esta a esquerda
            let result = Object.assign({}, userOld, values,)

            this.getPhoto(this.formUpdateEl)
                .then(content => {

                    result._photo = values.photo ? content : userOld._photo;

                    let user = new Users();

                    user.loadFromJson(result);

                    this.getTr(user, tr)

                    this.updateCount();

                    this.formUpdateEl.reset();

                    this.showPanelCreate();


                    btn.disabled = false;

                },
                    (err) => {
                        console.error('error: ', err)
                    })
        });
    }

    onSubmit() {
        //envento click salvar dados
        this.formEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]")
            btn.disabled = true

            let values = this.getValues(this.formEl)
            if (!values) return false;

            //obtendo a foto inserida no input
            // adicionando registro na tabela
            // add no localStoragy;
            // resetando formulario;
            //abilitando botao novamente 
            this.getPhoto(this.formEl)
                .then(content => {
                    values.photo = content;

                    this.insert(values)
                    this.addLine(values);

                    this.formEl.reset()

                    btn.disabled = false

                },
                    (err) => {
                        console.error('error: ', err)
                    })
        });
    }

    // obtendo foto inserida no input file
    getPhoto(formEl) {

        return new Promise((resolve, reject) => { //criando uma promisse


            // leitura do input file
            let fileReader = new FileReader();

            // filtra o input foto do formulario;
            let elements = [...formEl].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            });

            // obter a propriedade file 
            //contem (nome, tamanho, ultima atualizacao ...)
            let file = elements[0].files[0];

            // toda vez que o arquivo for carregado
            // vai retornar o resultado (caminho do arquivo)
            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            // se tiver algo de errado rejeite a promisse
            fileReader.onerror = (e) => {
                reject(e)
            }

            // se veio arquivo retorne esse arquivo se nao retorne 
            // o arquivo que ta na pasta dist
            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        });
    }

    //obter valores do formulario quando cadastrar
    getValues(formEl) {
        let user = {};
        let isValid = true; // variavel de controle se nao houver error

        // quando cadastrar agrupo os campos e o percorro
        [...formEl].forEach(function (field, index) {

            //validando os campos 
            //(se existe essas posicoes no formulario ) e
            //(se o valor for nullo)
            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                //add classe de error
                field.parentElement.classList.add('has-error')
                isValid = false;
            }

            // validacao de campos para preencher o input
            // dos tipos checkbox e radio 
            // ou entao o input normal
            if (field.name == 'gender') {
                if (field.checked) {
                    user[field.name] = field.value;
                }
            } else if (field.name == 'admin') {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });

        // não occereu tudo certo nas validacoes !!
        if (!isValid) {
            return false
        }

        // tudo validado ? crie um novo usuario
        return new Users(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin,
            user.register
        );
    }

    //obter dados da sessio storage
    getUserStoragi() {
        let users = [];

        if (localStorage.getItem("users")) {
            users = JSON.parse(localStorage.getItem("users"));
        }
        return users;
    }

    //dados da session storage
    selectAll() {
        let users = this.getUserStoragi();
        users.forEach(dataUser => {
            let user = new Users();

            user.loadFromJson(dataUser);

            this.addLine(user);
        });
    }

    //session storage
    insert(data) {

        let users = this.getUserStoragi();

        users.push(data);

        // sessionStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("users", JSON.stringify(users));
    }

    //add as lnhas la na tabela
    addLine(dataUser) {

        let tr = this.getTr(dataUser);

        this.tableEl.appendChild(tr)
        this.updateCount();
    }

    // obter as linhas da tabela ou cria-las
    getTr(dataUser, tr = null) {
        if (tr === null) {
            tr = document.createElement('tr');
        }

        // converte de obj/string e inserir o dados do usuario no novo campo user
        tr.dataset.user = JSON.stringify(dataUser);

        // escreve as informacoes do usuario na linha em cada coluna da tabela
        tr.innerHTML = `
        <tr>
            <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
            <td>${dataUser.name}</td>
            <td>${dataUser.email}</td>
            <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
            <td>${Ultils.dateFormat(dataUser.register)}</td>
            <td>
                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;

        // depois de criar o registro da tabela adiciono os eventos nos botoes
        this.addEventesTr(tr);

        return tr;
    }

    // add eventos nos botoes que foram criados.
    addEventesTr(tr) {

        // click no botao delete
        tr.querySelector('.btn-delete').addEventListener("click", (e) => {
            if (confirm("Deseja realmente excluir?")) {
                //remove usuario da tabela
                tr.remove();

                // atualiza o painel numerico de usuarios
                this.updateCount();
            }
        });

        //click do botao editar
        tr.querySelector('.btn-edit').addEventListener("click", (e) => {
            //transforma os dados em obj
            let json = JSON.parse(tr.dataset.user);

            //acessa dataset cria trIndex 
            //e obtem o index do usuario na tabela
            //com a propiedade (sectionRowIndex)
            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            // percorrer os dados do usuario
            for (let name in json) {
                //pesquisa os inputs atravez do [name] e retira o '_'
                let field = this.formUpdateEl.querySelector(`[name="${name.replace('_', '')}"]`)

                if (field) {

                    switch (field.type) {
                        case 'file':
                            continue;
                            break;

                        case 'radio':
                            field = this.formUpdateEl.querySelector(`[name="${name.replace('_', '')}"][value="${json[name]}"]`);
                            field.checked = true;
                            break;

                        case 'checkbox':
                            field.checked = json[name];
                            break;

                        default:
                            field.value = json[name];
                    }
                }
            }

            this.formUpdateEl.querySelector('.foto').src = json._photo;
            this.showPanelUpdate();
        })
    }

    // mostra formulario de create
    // esconde formulario update
    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = 'block';
        document.querySelector("#box-user-update").style.display = 'none';
    }

    // mostra formulario de update
    // esconde formulario create
    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = 'none';
        document.querySelector("#box-user-update").style.display = 'block';
    }

    //fica observando se foi add algum usuario
    // valida se é adm ou não e adiciona 
    //no card de usuario ou adm na tela
    updateCount() {
        let numberUser = 0;
        let numberAdmin = 0;
        //Acessando colecao de tr dentro da tabela e percorrendo
        [...this.tableEl.children].forEach(tr => {
            numberUser++;
            //DataSete todos os dados de um usuario converte para objeto
            let user = JSON.parse(tr.dataset.user);
            // se for adm acrescenta na variavel
            if (user._admin) numberAdmin++;
        })
        // colocando o valor la na tela.
        document.getElementById('number-users').innerHTML = numberUser;
        document.getElementById('number-users-admin').innerHTML = numberAdmin;
    }
}