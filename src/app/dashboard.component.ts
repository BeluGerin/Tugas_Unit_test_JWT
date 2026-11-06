import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Menu, MenuService } from './menu.service';
import { AuthService } from './auth.service';
import { MasterDetailComponent } from './master-detail.component';
import { CascadeDropdown } from './cascade-dropdown/cascade-dropdown';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, FormsModule, MasterDetailComponent, CascadeDropdown],
  template: `
    <div class="main-layout">
      <!-- SIDEBAR -->
      <div class="sidebar-container">
        <h3>Sidebar Menu</h3>
        <ul class="menu-list">
          <li *ngFor="let menu of menuList$ | async" class="menu-item">
            
            <div *ngIf="menu.children && menu.children.length > 0; else singleMenu" 
                 class="menu-parent" 
                 (click)="toggleMenu(menu)">
              <span>{{ menu.menu_name }}</span>
            </div>

            <ng-template #singleMenu>
              <a (click)="selectMenu(menu.menu_name)" class="menu-link">{{ menu.menu_name }}</a>
            </ng-template>

            <ul class="submenu" *ngIf="menu.children && menu.children.length > 0" [class.show]="menu.isOpen">
              <li *ngFor="let sub of menu.children">
                <a (click)="selectMenu(sub.menu_name)" class="submenu-link">↳ {{ sub.menu_name }}</a>
              </li>
            </ul>

          </li>
        </ul>
        <button class="btn-logout" (click)="logout()">Logout</button>
      </div>

      <!-- CONTENT PAGE -->
      <div class="content-container">
        <h2>Halaman: {{ activePage }}</h2>
        <hr>

        <!-- DASHBOARD -->
        <div *ngIf="activePage === 'Dashboard'">
          <p>Selamat datang di sistem manajemen aplikasi Anda!</p>
        </div>

        <!-- USER MANAGEMENT (CRUD) -->
        <div *ngIf="activePage === 'User Management'">
          <h3>Kelola Data Pengguna</h3>
          
          <div class="form-card">
            <h4>{{ isEditUser ? 'Edit User' : 'Tambah User Baru' }}</h4>
            <input type="text" placeholder="Nama" [(ngModel)]="userForm.name">
            <input type="email" placeholder="Email" [(ngModel)]="userForm.email">
            <input type="text" placeholder="Role" [(ngModel)]="userForm.role">
            <button class="btn-save" (click)="saveUserSubmit()">{{ isEditUser ? 'Update' : 'Simpan' }}</button>
            <button class="btn-cancel" *ngIf="isEditUser" (click)="resetUserForm()">Batal</button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama</th>
                <th>Email</th>
                <th>Role</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of usersList">
                <td>{{ user.id }}</td>
                <td>{{ user.name }}</td>
                <td>{{ user.email }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <button class="btn-edit" (click)="editUser(user)">Edit</button>
                  <button class="btn-delete" (click)="deleteUser(user.id)">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- DATA BARANG (CRUD) -->
        <div *ngIf="activePage === 'Data Barang'">
          <h3>Kelola Inventaris Barang</h3>

          <div class="form-card">
            <h4>{{ isEditBarang ? 'Edit Barang' : 'Tambah Barang Baru' }}</h4>
            <input type="text" placeholder="Nama Barang" [(ngModel)]="barangForm.nama_barang">
            <input type="number" placeholder="Stok" [(ngModel)]="barangForm.stok">
            <input type="number" placeholder="Harga" [(ngModel)]="barangForm.harga">
            <button class="btn-save" (click)="saveBarangSubmit()">{{ isEditBarang ? 'Update' : 'Simpan' }}</button>
            <button class="btn-cancel" *ngIf="isEditBarang" (click)="resetBarangForm()">Batal</button>
          </div>

          <table class="data-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Nama Barang</th>
                <th>Stok</th>
                <th>Harga</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let item of barangList">
                <td>{{ item.id }}</td>
                <td>{{ item.nama_barang }}</td>
                <td>{{ item.stok }}</td>
                <td>Rp {{ item.harga }}</td>
                <td>
                  <button class="btn-edit" (click)="editBarang(item)">Edit</button>
                  <button class="btn-delete" (click)="deleteBarang(item.id)">Hapus</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- MASTER DETAIL -->
        <div *ngIf="activePage === 'Master Detail'">
          <app-master-detail></app-master-detail>
        </div>

        <!-- SAMPLE DROPDOWN CASCADE -->
        <div *ngIf="activePage === 'Sample Dropdown Cascade'">
          <app-cascade-dropdown></app-cascade-dropdown>
        </div>

        <!-- SETTINGS -->
        <div *ngIf="activePage === 'Settings'">
          <p>Pengaturan Aplikasi dan Konfigurasi Sistem.</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .main-layout { display: flex; height: 100vh; font-family: Arial, sans-serif; margin: 0; }
    .sidebar-container { width: 260px; background-color: #2c3e50; color: #ecf0f1; padding: 20px; box-sizing: border-box; }
    .content-container { flex: 1; padding: 30px; background-color: #f4f6f7; overflow-y: auto; }
    h3 { text-align: center; margin-bottom: 20px; font-size: 18px; border-bottom: 1px solid #34495e; padding-bottom: 10px; }
    .menu-list { list-style: none; padding: 0; margin: 0; }
    .menu-item { margin-bottom: 8px; }
    .menu-parent, .menu-link, .submenu-link { display: flex; align-items: center; padding: 10px 15px; color: #ecf0f1; text-decoration: none; border-radius: 4px; cursor: pointer; transition: background 0.2s; font-size: 14px; }
    .menu-parent:hover, .menu-link:hover, .submenu-link:hover { background-color: #34495e; }
    .submenu { list-style: none; padding-left: 15px; margin: 0; max-height: 0; overflow: hidden; transition: max-height 0.3s ease-in-out; }
    .submenu.show { max-height: 200px; }
    .submenu-link { padding: 8px 10px; font-size: 13px; color: #bdc3c7; }
    
    .form-card { background: #fff; padding: 15px; margin-bottom: 20px; border-radius: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); display: flex; gap: 10px; align-items: center; flex-wrap: wrap; }
    .form-card h4 { width: 100%; margin: 0 0 10px 0; font-size: 15px; color: #2c3e50; }
    .form-card input { padding: 8px; border: 1px solid #ccc; border-radius: 4px; flex: 1; min-width: 150px; }
    
    .btn-save { background: #27ae60; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    .btn-cancel { background: #95a5a6; color: white; border: none; padding: 8px 15px; border-radius: 4px; cursor: pointer; }
    .btn-edit { background: #f39c12; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; margin-right: 5px; }
    .btn-delete { background: #c0392b; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
    
    .data-table { width: 100%; border-collapse: collapse; background: white; border-radius: 6px; overflow: hidden; }
    .data-table th, .data-table td { border: 1px solid #ddd; padding: 10px; text-align: left; }
    .data-table th { background-color: #2c3e50; color: white; }
    .btn-logout { margin-top: 20px; width: 100%; background: #c0392b; color: white; border: none; padding: 10px; border-radius: 4px; cursor: pointer; }
  `]
})
export class DashboardComponent {
  menuList$: Observable<Menu[]>;
  usersList: any[] = [];
  barangList: any[] = [];
  activePage: string = 'Dashboard';

  // State Form User
  userForm: any = { id: null, name: '', email: '', role: '' };
  isEditUser: boolean = false;

  // State Form Barang
  barangForm: any = { id: null, nama_barang: '', stok: '', harga: '' };
  isEditBarang: boolean = false;

  constructor(private menuService: MenuService, private auth: AuthService, private router: Router) {
    this.menuList$ = this.menuService.getMenus();
    this.loadUsers();
    this.loadBarang();
  }

  toggleMenu(menu: Menu): void {
    menu.isOpen = !menu.isOpen;
  }

  selectMenu(menuName: string): void {
    this.activePage = menuName;
  }

  logout(): void {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }

  // --- USER METHODS ---
  loadUsers(): void {
    this.menuService.getUsers().subscribe(data => this.usersList = data);
  }

  saveUserSubmit(): void {
    const action = this.isEditUser ? 'edit' : 'add';
    this.menuService.saveUser({ ...this.userForm, action }).subscribe(() => {
      this.loadUsers();
      this.resetUserForm();
    });
  }

  editUser(user: any): void {
    this.userForm = { ...user };
    this.isEditUser = true;
  }

  deleteUser(id: number): void {
    if (confirm('Yakin ingin menghapus user ini?')) {
      this.menuService.saveUser({ id, action: 'delete' }).subscribe(() => this.loadUsers());
    }
  }

  resetUserForm(): void {
    this.userForm = { id: null, name: '', email: '', role: '' };
    this.isEditUser = false;
  }

  // --- BARANG METHODS ---
  loadBarang(): void {
    this.menuService.getBarang().subscribe(data => this.barangList = data);
  }

  saveBarangSubmit(): void {
    const action = this.isEditBarang ? 'edit' : 'add';
    this.menuService.saveBarang({ ...this.barangForm, action }).subscribe(() => {
      this.loadBarang();
      this.resetBarangForm();
    });
  }

  editBarang(item: any): void {
    this.barangForm = { ...item };
    this.isEditBarang = true;
  }

  deleteBarang(id: number): void {
    if (confirm('Yakin ingin menghapus barang ini?')) {
      this.menuService.saveBarang({ id, action: 'delete' }).subscribe(() => this.loadBarang());
    }
  }

  resetBarangForm(): void {
    this.barangForm = { id: null, nama_barang: '', stok: '', harga: '' };
    this.isEditBarang = false;
  }
}