import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../auth/auth.service';

export interface Friend {
  id: number;
  firstName: string;
  lastName: string;
  phone: string;
  city: string;
  birthdate: string;
  userId: number;
}

@Component({
  selector: 'app-birthday-reminder',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './birthday-reminder.component.html',
  styleUrls: ['./birthday-reminder.component.scss']
})
export class BirthdayReminderComponent implements OnInit {
  friends = signal<Friend[]>([]);
  searchTerm = signal('');
  sortField = signal('firstName');
  sortDirection = signal('asc');
  showForm = signal(false);
  editingFriend = signal<Friend | null>(null);
  friendForm: FormGroup;

  constructor(
    private authService: AuthService,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.friendForm = this.fb.group({
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      phone: ['', [Validators.required, Validators.pattern(/^07[0-9]{8}$/)]],
      city: ['', [Validators.required]],
      birthdate: ['', [Validators.required]]
    });
  }

  ngOnInit() {
    this.loadFriends();
  }

  loadFriends() {
    const mockFriends: Friend[] = [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        phone: '0722123456',
        city: 'Bucharest',
        birthdate: '1990-05-15',
        userId: 1
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0733123456',
        city: 'Cluj',
        birthdate: '1985-12-20',
        userId: 1
      }
    ];
    this.friends.set(mockFriends);
  }

  addFriend() {
    this.editingFriend.set(null);
    this.friendForm.reset();
    this.showForm.set(true);
  }

  editFriend(friend: Friend) {
    this.editingFriend.set({ ...friend });
    this.friendForm.patchValue({
      firstName: friend.firstName,
      lastName: friend.lastName,
      phone: friend.phone,
      city: friend.city,
      birthdate: friend.birthdate
    });
    this.showForm.set(true);
  }

  saveFriend() {
    if (this.friendForm.invalid) {
      this.markFormGroupTouched();
      return;
    }

    const formValue = this.friendForm.value;
    const currentUser = this.authService.getUserData();

    if (this.editingFriend()) {
      // Edit existing friend
      const updatedFriend: Friend = {
        ...this.editingFriend()!,
        ...formValue
      };

      this.friends.update(friends =>
        friends.map(f => f.id === updatedFriend.id ? updatedFriend : f)
      );
    } else {
      // Add new friend
      const newFriend: Friend = {
        id: Date.now(),
        ...formValue,
        userId: currentUser?.id || 1
      };

      this.friends.update(friends => [...friends, newFriend]);
    }

    this.closeModal();
  }

  deleteFriend(id: number) {
    if (confirm('Are you sure you want to delete this friend?')) {
      this.friends.update(friends => friends.filter(f => f.id !== id));
    }
  }

  closeModal() {
    this.showForm.set(false);
    this.editingFriend.set(null);
    this.friendForm.reset();
  }

  logout() {
    this.authService.logout();
  }

  private markFormGroupTouched() {
    Object.keys(this.friendForm.controls).forEach(key => {
      this.friendForm.get(key)?.markAsTouched();
    });
  }

  get filteredFriends() {
    return this.friends().filter(friend =>
      friend.firstName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
      friend.lastName.toLowerCase().includes(this.searchTerm().toLowerCase()) ||
      friend.city.toLowerCase().includes(this.searchTerm().toLowerCase())
    );
  }

  get sortedFriends() {
    return this.filteredFriends.sort((a, b) => {
      const fieldA = a[this.sortField() as keyof Friend]?.toString().toLowerCase() || '';
      const fieldB = b[this.sortField() as keyof Friend]?.toString().toLowerCase() || '';

      if (this.sortDirection() === 'asc') {
        return fieldA.localeCompare(fieldB);
      } else {
        return fieldB.localeCompare(fieldA);
      }
    });
  }

  sort(field: string) {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'asc' ? 'desc' : 'asc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('asc');
    }
  }

  // Helper methods for template validation
  get firstName() { return this.friendForm.get('firstName'); }
  get lastName() { return this.friendForm.get('lastName'); }
  get phone() { return this.friendForm.get('phone'); }
  get city() { return this.friendForm.get('city'); }
  get birthdate() { return this.friendForm.get('birthdate'); }
}