import Modal from './modal';
import config from '../config';
import Form from './Form';

export default class SignUpModal extends Modal {

	afterOpen() {
		this.$form = document.getElementById('signup-form');
		this.rules = {
			email: 'required|email',
			password: 'required',
			'password-confirmation': 'required|match:password'
		};
		this.form = new Form(this.$form, this.rules);
	}

	proceed() {
		if (this.form.validate()) {
			this.form.removeAllErrorElements();
			console.log('Perfect!');
		} else {
			this.form.displayErrors();
		}
		//this.close();
	}

	static listen() {
		let $signUpBtn = document.querySelector('.js-signup');
		$signUpBtn.addEventListener('click', SignUpModal.toggle);
	}

	static toggle() {
		if (Modal.instance) {
			Modal.instance.close();
		} else {
			SignUpModal.open();
		}
	}

	static open() {
		let markup = `
            <header><h2>Sign Up</h2></header>
            <div class="container">
                <form id="signup-form" action="${config.backend}/signup" method="post">
                    <div class="input-group">
                        <label for="email">
                            Email
                        </label>
                        <div class="flex">
                            <input required id="email" name="email" type="email">
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="password">
                            Password
                        </label>
                        <div class="flex">
                            <input required id="password" name="password" type="password">
                        </div>
                    </div>
                    <div class="input-group">
                        <label for="password-confirmation">
                            Confirm your password
                        </label>
                        <div class="flex">
                            <input required id="password-confirmation" name="password-confirmation" type="password">
                        </div>
                    </div>
                </form>
			</div>
            <div class="submit">
                <button class="js-ok modal__btn">Sign me up!</button>
                <button class="js-cancel modal__btn modal__btn--link">Maybe later...</button>
            </div>
        `;
		let modal = new this(markup);
		modal.classNames('signup__modal');
		modal.open();
	}

	static close() {
		Modal.instance.close();
	}
}
