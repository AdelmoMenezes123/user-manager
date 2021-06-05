class Users {

    constructor(name, gender, birth, email, password, country, photo, admin) {
        this._name = name;
        this._gender = gender;
        this._birth = birth;
        this._email = email;
        this._password = password;
        this._country = country;
        this._photo = photo;
        this._admin = admin;
        this._register = new Date();
    }

    get nome() {
        return this._name
    }

    get gender() {
        return this._gender
    }

    get birth() {
        return this._birth
    }

    get email() {
        return this._email
    }

    get password() {
        return this._password
    }

    get country() {
        return this._country
    }

    get photo() {
        return this._photo
    }

    set photo(value) {
        this._photo = value;
    }

    get admin() {
        return this._admin
    }

    get register() {
        return this._register
    }
}

