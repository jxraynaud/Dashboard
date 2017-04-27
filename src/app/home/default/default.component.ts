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
    }, {
      color: 'blue-700',
      description: 'Find Campaigns, Kpis, Tags, Third party pixels, etc here!',
      icon: 'color_lens',
      route: 'user',
      title: 'Campaign Manager',
    }, {
      color: 'teal-700',
      description: 'Get your messages, change your password, etc here!',
      icon: 'view_quilt',
      route: 'layouts',
      title: 'User Management',
    }, {
      color: 'green-700',
      description: 'Go to the admin section (login required)',
      icon: 'picture_in_picture',
      route: 'components', // to be changed
      title: 'Admin',
    },
  ];

  ngOnInit(){}

}
