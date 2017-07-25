import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-default',
  templateUrl: './default.component.html',
  styleUrls: ['./default.component.css']
})
export class DefaultComponent implements OnInit {

  constructor() { }

  items: Object[] = [{
      color: 'purple-700',
      description: 'Multi-Attribution, fraud detecor tools are here, as well as the reporting tool!',
      icon: 'dashboard',
      route: 'dashboard',
      title: 'Dashboard',
    },
    {
        color: 'blue-500',
        description: 'User account management',
        icon: 'face',
        route: 'account',
        title: 'User Account',
      },
  ];

  ngOnInit(){}

}
