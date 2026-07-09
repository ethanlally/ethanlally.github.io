import { Routes } from '@angular/router';
import { Home } from './home/home';
import { About } from './about/about';
import { Links } from './links/links';
import { ActivityComponent } from './activity/activity';
import { NotFoundComponent } from './not-found/not-found';

export const routes: Routes = [
    { path: '', component: Home },
    { path: 'about', component: About },
    { path: 'links', component: Links },
    { path: 'activity', component: ActivityComponent },
    { path: '**', component: NotFoundComponent }
];
