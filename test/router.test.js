import {
    expect
} from 'chai';
import Router from '../src/router';

describe('properties can be set and retrieved', () => {

    let router;

    beforeEach(() => {
        router = new Router([{
            url: '',
            handler: () => {}
        }]);
    });

    test('routes can be set and retrieved', () => {
        router.routes = [{
            url: '/a/b',
            handler: () => {}
        }];
        expect(router.routes).to.be.instanceOf(Array);
    });

    test('routes fail to be set', () => {
        expect(() => {
            router.routes = ''
        }).to.throw();

        // expect(() => {
        //     router.routes = [1];
        // }).to.throw();

        // expect(() => {
        //     router.routes = [{}];
        // }).to.throw();

        // expect(() => {
        //     router.routes = [{
        //         url: 1
        //     }];
        // }).to.throw();

        // expect(() => {
        //     router.routes = [{
        //         url: 'asd',
        //         handler: ''
        //     }];
        // }).to.throw();
    });
});