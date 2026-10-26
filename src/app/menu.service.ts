import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

export interface Menu {
  id: number;
  menu_name: string;
  url_menu: string;
  parent_id: number;
  is_active: number;
  isOpen?: boolean;
  children?: Menu[];
}

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  private apiUrl = 'http://localhost/Unit_test/api-menu.php';
  private usersUrl = 'http://localhost/Unit_test/api-users.php';
  private barangUrl = 'http://localhost/Unit_test/api-barang.php';
  private userActionUrl = 'http://localhost/Unit_test/api-user-action.php';
  private barangActionUrl = 'http://localhost/Unit_test/api-barang-action.php';

  constructor(private http: HttpClient) {}

  getMenus(): Observable<Menu[]> {
    return this.http.get<Menu[]>(this.apiUrl).pipe(
      map(rawMenus => this.buildMenuTree(rawMenus))
    );
  }

  getUsers(): Observable<any[]> {
    return this.http.get<any[]>(this.usersUrl);
  }

  getBarang(): Observable<any[]> {
    return this.http.get<any[]>(this.barangUrl);
  }

  saveUser(data: any): Observable<any> {
    return this.http.post<any>(this.userActionUrl, data);
  }

  saveBarang(data: any): Observable<any> {
    return this.http.post<any>(this.barangActionUrl, data);
  }

  private buildMenuTree(list: Menu[]): Menu[] {
    if (!Array.isArray(list)) return [];
    const map = new Map<number, Menu>();
    const roots: Menu[] = [];

    list.forEach(item => {
      map.set(item.id, { ...item, isOpen: false, children: [] });
    });

    list.forEach(item => {
      const node = map.get(item.id);
      if (node) {
        if (item.parent_id === 0) {
          roots.push(node);
        } else {
          const parentNode = map.get(item.parent_id);
          if (parentNode) {
            parentNode.children?.push(node);
          }
        }
      }
    });

    return roots;
  }
}
