class UserController {
    constructor(formId, tableId) {
        this.formEl = document.getElementById(formId)
        this.tableEl = document.getElementById(tableId)

        this.onSubmit();
    }

    onSubmit() {
        this.formEl.addEventListener('submit', event => {
            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]")
            btn.disabled = true

            let values = this.getValues()
            if (!values) return false;


            this.getPhoto()
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

    getPhoto() {

        return new Promise((resolve, reject) => {

            let fileReader = new FileReader();

            let elements = [...this.formEl].filter(item => {
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

    getValues() {
        let user = {};
        let isValid = true;

        [...this.formEl].forEach(function (field, index) {

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
                <button type="button" class="btn btn-primary btn-xs btn-flat">Editar</button>
                <button type="button" class="btn btn-danger btn-xs btn-flat">Excluir</button>
            </td>
        </tr>
        `;

        this.tableEl.appendChild(tr)
        this.updateCount();
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