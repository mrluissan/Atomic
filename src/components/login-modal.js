import Modal from './modal';
import config from '../config';
import Form from './Form';
import Auth from '../auth';

export default class SignUpModal extends Modal {

	afterOpen() {
		this.$form = document.getElementById('signup-form');
		this.rules = {
			email: 'required|email',
			password: 'required'
		};
		this.form = new Form(this.$form, this.rules);
	}

	proceed(button) {
		button.disabled = true;
		if (this.form.validate()) {
			this.form.removeAllErrorElements();
			this.form.submit()
				.catch(errors => {
					this.form.validator.errors = errors;
					this.form.displayErrors();
					button.disabled = false;
				})
				.then(data => {
					Auth.login(data.token);
					// fetch
					this.getContainer().innerHTML = '<p>Getting your sources...</p>';
					fetch(config.backend + '/sources', window.app.fetchOptions)
						.then(r => r.json())
						.then(data => {
							console.log(data);
						})
						.then(() => {
							this.getContainer().innerHTML = '<p>Getting your categories...</p>';
							return fetch(config.backend + '/categories', window.app.fetchOptions);
						})
						.then(r => r.json())
						.then(data => {
							console.log(data);
							this.close();
						});
				});
		} else {
			this.form.displayErrors();
			button.disabled = false;
		}
	}

	static listen() {
		let $signUpBtn = document.querySelector('.js-login');
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
            <header><h2>Log In</h2></header>
            <div class="container">
                <form id="signup-form" action="${config.backend}/login" method="post">
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
                </form>
			</div>
            <div class="submit">
                <button class="js-ok modal__btn">Log me in!</button>
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