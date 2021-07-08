class UserController {
    constructor(formIdCreate, formIdUpdate, tableId) {
        this.formEl = document.getElementById(formIdCreate)
        this.formUpdateEl = document.getElementById(formIdUpdate)
        this.tableEl = document.getElementById(tableId)

        this.onSubmit();
        this.onEdit();
    }

    onEdit() {
        document.querySelector('#box-user-update .btn-cancel').addEventListener('click', e => {
            this.showPanelCreate()
        });

        this.formUpdateEl.addEventListener("submit", event => {
            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]")
            btn.disabled = true

            let values = this.getValues(this.formUpdateEl)

            let index = this.formUpdateEl.dataset.trIndex;

            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            //Object.assign = copia o valor de atributo de m obj 
            // cria um obj destino, retornando este obj
            // todos que estao a direita sobre escreve o que esta a esquerda
            let result = Object.assign({}, userOld, values,)

            this.getPhoto(this.formUpdateEl)
                .then(content => {

                    result._photo = values.photo ? content : userOld._photo;

                    tr.dataset.user = JSON.stringify(result);


                    tr.innerHTML = `
                        <tr>
                            <td><img src="${result._photo}" alt="User Image" class="img-circle img-sm"></td>
                            <td>${result._name}</td>
                            <td>${result._email}</td>
                            <td>${(result._admin) ? 'Sim' : 'Não'}</td>
                            <td>${Ultils.dateFormat(result._register)}</td>
                            <td>
                                <button type="button" class="btn btn-primary btn-edit btn-xs btn-flat">Editar</button>
                                <button type="button" class="btn btn-danger btn-delete btn-xs btn-flat">Excluir</button>
                            </td>
                        </tr>
                    `;

                    this.addEventesTr(tr);

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
        this.formEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]")
            btn.disabled = true

            let values = this.getValues(this.formEl)
            if (!values) return false;


            this.getPhoto(this.formEl)
                .then(content => {
                    values.photo = content;
                    this.addLine(values);

                    this.formEl.reset()

                    btn.disabled = false

                },
                    (err) => {
                        console.error('error: ', err)
                    })
        });
    }

    getPhoto(formEl) {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl].filter(item => {
                if (item.name === 'photo') {
                    return item;
                }
            });

            let file = elements[0].files[0];


            fileReader.onload = () => {
                resolve(fileReader.result);
            };

            fileReader.onerror = (e) => {
                reject(e)
            }

            if (file) {
                fileReader.readAsDataURL(file);
            } else {
                resolve('dist/img/boxed-bg.jpg');
            }

        })
    }

    getValues(formEl) {
        let user = {};
        let isValid = true;

        [...formEl].forEach(function (field, index) {

            if (['name', 'email', 'password'].indexOf(field.name) > -1 && !field.value) {
                field.parentElement.classList.add('has-error')
                isValid = false;
            }

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

        if (!isValid) {
            return false
        }

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

    addLine(dataUser) {

        let tr = document.createElement('tr');

        tr.dataset.user = JSON.stringify(dataUser);
        console.log(dataUser)
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

        this.addEventesTr(tr);

        this.tableEl.appendChild(tr)
        this.updateCount();
    }

    addEventesTr(tr) {

        tr.querySelector('.btn-delete').addEventListener("click", (e) => {
            if(confirm("Deseja realmente excluir?")){
                tr.remove();
                
                this.updateCount();
            }
        });


        tr.querySelector('.btn-edit').addEventListener("click", (e) => {
            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json) {
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

    showPanelCreate() {
        document.querySelector("#box-user-create").style.display = 'block';
        document.querySelector("#box-user-update").style.display = 'none';
    }

    showPanelUpdate() {
        document.querySelector("#box-user-create").style.display = 'none';
        document.querySelector("#box-user-update").style.display = 'block';
    }

    updateCount() {
        let numberUser = 0;
        let numberAdmin = 0;

        [...this.tableEl.children].forEach(tr => {
            numberUser++;
            let user = JSON.parse(tr.dataset.user);
            if (user._admin) numberAdmin++;
        })
        document.getElementById('number-users').innerHTML = numberUser;
        document.getElementById('number-users-admin').innerHTML = numberAdmin;

    }
}