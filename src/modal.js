import Post from '../src/post';
import Router from './router';
import { distanceInWords } from 'date-fns';

export default class Modal {
	constructor() {

	}

	set from(position) {
		if (!(['width', 'height', 'top', 'left'].every(p => position[p] != null))) throw new Error('position should be of type DOMRect');
		this._from = {
			width: position.width,
			height: position.height,
			top: position.top,
			left: position.left
		};
	}

	get from() {
		return `top: ${this._from.top}px; left: ${this._from.left}px; width: ${this._from.width}px; height: ${this._from.height}px`;
	}

	setFromPost(post) {
		if (!(post instanceof Post)) throw new Error('post should be of type Post');
		// for (let property in post) {
		// 	this[property.substr(1)] = post[property];
		// }
		this.post = post;
	}

	async init() {
		let markup = await this.render();
		await this.inject(markup);
		await this.setProperties();
		await this.open();
		await this.addListeners();
	}

	async setProperties() {
		this.modal = document.body.querySelector('.post--modal');
		this.$markAsRead = this.modal.querySelector('.post--modal__read');
		this.$markAsFavorite = this.modal.querySelector('.post--modal__favorite');
		this.$offline = this.modal.querySelector('.post--modal__offline');
		this.$cloak = document.querySelector('.cloak:last-child');
		this.events = [{
			el: this.modal.querySelector('.post--modal__back'),
			event: 'click',
			fn: this.destroy
		},
		{
			el: this.modal,
			event: 'transitionend',
			fn: () => {
				if (!this.opened) {
					setTimeout(() => {
						Array.from(document.querySelectorAll('.post--modal')).forEach(modal => modal.remove());
					}, 50);
				}
			}
		},
		{
			el: this.modal,
			event: 'keypress',
			fn: e => {
				if (e.key === 'Escape') this.destroy();
			}
		},
		{
			el: this.$markAsRead,
			event: 'click',
			fn: this.toggleMarkAsRead
		},
		{
			el: this.$markAsFavorite,
			event: 'click',
			fn: this.toggleMarkAsFavorite
		},
		{
			el: this.$offline,
			event: 'click',
			fn: this.toggleOfflineSave
		},
		{
			el: this.$cloak,
			event: 'click',
			fn: this.destroy
		}
		];
	}

	toggleMarkAsRead(e) {
		e.preventDefault();
		this.post.isRead = !this.post.isRead;
		if (this.post.isRead) {
			this.$markAsRead.classList.add('checked');
		} else {
			this.$markAsRead.classList.remove('checked');
		}
		// update on db
		this.post.update();
	}

	toggleMarkAsFavorite(e) {
		e.preventDefault();
		this.post.isFavorite = !this.post.isFavorite;
		if (this.post.isFavorite) {
			this.$markAsFavorite.classList.add('checked');
		} else {
			this.$markAsFavorite.classList.remove('checked');
		}
		// update on db
		this.post.update();
	}

	toggleOfflineSave(e) {
		e.preventDefault();
		window.db.saved.get(this.post._id).then(doc => {
			window.db.saved.remove(doc).then(() => {
				this.$offline.classList.remove('checked');
			});
		}).catch(() => {
			window.db.saved.put(this.post.toObject()).then(() => {
				this.$offline.classList.add('checked');
			});
		});
	}

	async destroy() {
		await this.close();
		await this.removeListeners();
		await Router.back();
	}

	async inject(markup) {
		document.body.insertAdjacentHTML('beforeend', markup);
	}

	async open() {
		this.opened = true;
		document.body.classList.add('modal-opened');
		setTimeout(() => {
			this.modal.classList.add('active');
		}, 20);
		Modal.opened = this;
		Router.go(`${this.post.title} - ${window.app.name}`, `#/post/${this.post.slug()}`);
	}

	static async close() {
		if (Modal.opened instanceof Modal) {
			await Modal.opened.destroy();
			Modal.opened = null;
		}
	}

	async close() {
		this.opened = false;
		document.querySelector('.cloak:last-child').remove();
		document.body.classList.remove('modal-opened');
		this.modal.classList.remove('active');
		this.modal.classList.add('closing');
	}

	async removeListeners() {
		this.events.forEach(event => {
			event.el.removeEventListener(event.event, event.fn.bind(this));
		});
	}

	async addListeners() {
		this.events.forEach(event => {
			event.el.addEventListener(event.event, event.fn.bind(this), false);
		});
	}

	async render() {
		let isSaved = await this.post.isSaved();
		return `
			<article class="post--modal" style="${this.from}">
				<div class="post--modal__toolbar">
					<button title="Go back" class="btn post--modal__back"><i class="fas fa-arrow-left"></i></button>
					<div class="align-right d-flex">
						<button title="Mark as read" class="btn post--modal__read ${this.post.isRead ? 'checked' : ''}"><i class="fas fa-check-circle"></i></button>
						<button title="Mark as favorite" class="btn post--modal__favorite ${this.post.isFavorite ? 'checked' : ''}"><i class="fas fa-heart"></i></button>
						<button title="Save to read offline" class="btn post--modal__offline ${isSaved ? 'checked' : ''}"><i class="fas fa-hdd"></i></button>
					</div>
				</div>
				${ this.post.image ? `<img class="post__img" src="${this.post.image}" alt="Article featured image">` : '' }
				<div class="post--modal__container ${!this.post.image ? 'no-image' : ''}">
					<h2 class="post__title">${this.post.title}</h2>
					<div class="post__content">${this.post.content} - <a href="${this.post.link}" target="_blank" rel="noopener">Read More</a></div>
					<p class="post__source" class="notranslate" translate="no">
						${this.post.source.render()} - <a href="${this.post.link}" target="_blank">${this.post.link}</a>
					</p>
					<time datetime="${this.post.timestamp}">
						${ distanceInWords(new Date(), new Date(this.post.timestamp), {addSuffix: true}) }
					</time>
				</div>
			</article>
			<div class="cloak"></div>
	    `;
	}

	static from(post, position) {
		let modal = new Modal();
		modal.setFromPost(post);
		modal.from = position;
		return modal;
	}
}
