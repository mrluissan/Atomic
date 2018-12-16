import Post from '../post';
import Source from '../source';
import Parser from '../parser';
import Loader from '../components/Loader';
import Router from '../router';

export default class Home {
	static async init() {
		let sources;
		Loader.toggle();

		let cachedPosts = await Post.all();

		if (cachedPosts.length) {
			Post.render(cachedPosts)
				.then(() => {
					Loader.toggle();
					Router.home();
					document.querySelector('.current-section').textContent = 'All articles';
					// change app state
					window.app.state = 'home';
				})
				.catch(e => {
					throw new Error(e);
				});
		}

		try {
			sources = await window.db.sources.allDocs({
				include_docs: true
			});
			sources = sources.rows.filter(row => row.doc.url).map(row => row.doc);
			Source.render(sources.map(Source.fromObject));

			let posts = [];
			let promises = [];

			for (let source of sources) {
				promises.push(
					fetch(window.app.proxy + source.url, {mode: 'cors'})
						.then(response => response.text())
						.then(data => {
							let parser = new Parser({
								data: data,
								source: source
							});
							posts.push(...parser.posts());
						})
				);
			}

			Promise.all(promises).then(() => {
				// save the posts that are not already stored
				for (let post of posts) {
					// eslint-disable-next-line no-unused-vars
					window.db.posts.get(post._id, (_, doc) => {
						if (_) {
							window.db.posts.put(post.toObject());
						}
					});
				}

				// and fetch from db
				if (!cachedPosts.length) {
					Post.all().then(posts => {
						Post.render(posts)
							.then(() => {
								Loader.toggle();
								Router.home();
								document.querySelector('.current-section').textContent = 'All articles';
								// change app state
								window.app.state = 'home';
							})
							.catch(e => {
								throw new Error(e);
							});
					});
				}
			});
		} catch (e) {
			// eslint-disable-next-line no-console
			console.error(e);
			if (!sources.length) {
				Loader.toggle();
				Post.render([]);
				return;
			}
		}
	}
}
