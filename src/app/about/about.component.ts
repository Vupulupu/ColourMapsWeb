import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  name: string;
  bio: string;
  avatar: string;
}

@Component({
  selector: 'app-about',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent {
  teamMembers: TeamMember[] = [
    {
      name: 'Ryan Bacher',
      bio: 'Junior at CSU, focusing in networking and cybersecuity, I work for the Research IT at CSU, and I am security+ certified .', 
      avatar: 'images/ryanimage.jpg'
	},
    {
      name: 'Richard Chavez',
      bio: 'Junior at CSU, concentrating in software engineering as well as a minor in mathematics.',
      avatar: 'images/richardimage.jpg' //path to image 
    },
    {
		name: 'Tarik Abughalib',
		bio: 'Junior at CSU, focusing on networks and security. Currently working towards my Security+ certification. ',
		avatar: 'images/tarikimage.jpg' //path to image 
	},
	{
		name: 'Team Member 4',
		bio: ' ',
		avatar: ' ' //path to image 
	},
		
  ];
}