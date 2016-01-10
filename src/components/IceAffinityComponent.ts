/// <reference path="../../typings/lib.es6.d.ts" />

import {Component} from './Component';

export class IceAffinityComponent extends Component {
    affinity: string;

    constructor(options: {} = {}) {
        super();
        this.affinity = 'ice';
    }
}
