import { Injectable, signal, computed, inject } from '@angular/core';
import { MedicineService } from '../../data/medicine.service';
import { UserService, User } from '../../data/user.service';
import { Medicine } from '../../data/models/medicine.model';

/**
 * Servicio de gestión de estado global de la aplicación
 * Usa signals de Angular 16+ para reactividad
 * Centraliza el estado de medicamentos, usuarios, autenticación, etc.
 */
@Injectable({ providedIn: 'root' })
export class AppStateService {
  private medicineService = inject(MedicineService);
  private userService = inject(UserService);

  // ============ MEDICAMENTOS ============

  private medicinesSignal = signal<Medicine[] | null>(null);
  private medicineLoadingSignal = signal(false);
  private medicineErrorSignal = signal<string | null>(null);

  // Computadas (readonly, se actualizan automáticamente)
  medicines = this.medicinesSignal.asReadonly();
  medicinesLoading = this.medicineLoadingSignal.asReadonly();
  medicinesError = this.medicineErrorSignal.asReadonly();

  // Computada: list vacía o no
  hasMedicines = computed(() => (this.medicinesSignal()?.length ?? 0) > 0);

  // Computada: medicamentos activos
  activeMedicines = computed(() => 
    this.medicinesSignal()?.filter(m => m.remainingDays !== undefined && m.remainingDays > 0) ?? []
  );

  // Computada: medicamentos por vencer (< 7 días)
  expiringMedicines = computed(() =>
    this.medicinesSignal()?.filter(m => m.remainingDays !== undefined && m.remainingDays > 0 && m.remainingDays <= 7) ?? []
  );

  // Computada: medicamentos vencidos
  expiredMedicines = computed(() =>
    this.medicinesSignal()?.filter(m => m.remainingDays !== undefined && m.remainingDays <= 0) ?? []
  );

  // ============ USUARIOS ============

  private usersSignal = signal<User[] | null>(null);
  private userLoadingSignal = signal(false);
  private userErrorSignal = signal<string | null>(null);
  private selectedUserSignal = signal<User | null>(null);

  users = this.usersSignal.asReadonly();
  usersLoading = this.userLoadingSignal.asReadonly();
  usersError = this.userErrorSignal.asReadonly();
  selectedUser = this.selectedUserSignal.asReadonly();

  // Computada: total de usuarios
  userCount = computed(() => this.usersSignal()?.length ?? 0);

  // ============ FILTROS Y BÚSQUEDA ============

  private searchQuerySignal = signal('');
  searchQuery = this.searchQuerySignal.asReadonly();

  // Computada: medicamentos filtrados por búsqueda
  filteredMedicines = computed(() => {
    const query = this.searchQuerySignal().toLowerCase();
    if (!query) return this.medicinesSignal() ?? [];
    
    return this.medicinesSignal()?.filter(m =>
      m.name.toLowerCase().includes(query) ||
      m.dosage.toLowerCase().includes(query)
    ) ?? [];
  });

  // ============ UI STATE ============

  private sidebarOpenSignal = signal(false);
  private darkModeSignal = signal(false);

  sidebarOpen = this.sidebarOpenSignal.asReadonly();
  darkMode = this.darkModeSignal.asReadonly();

  // ============ MÉTODOS PÚBLICOS ============

  /**
   * Cargar medicamentos desde el servicio HTTP
   */
  loadMedicines() {
    if (this.medicineLoadingSignal()) return; // Evitar carga duplicada

    this.medicineLoadingSignal.set(true);
    this.medicineErrorSignal.set(null);

    this.medicineService.getAll().subscribe({
      next: (medicines: any) => {
        this.medicinesSignal.set(medicines as Medicine[]);
        this.medicineLoadingSignal.set(false);
      },
      error: (err: any) => {
        this.medicineErrorSignal.set(err.message || 'Error cargando medicamentos');
        this.medicineLoadingSignal.set(false);
      }
    });
  }

  /**
   * Agregar un medicamento localmente (sin guardar en servidor)
   */
  addMedicineLocal(medicine: Medicine) {
    this.medicinesSignal.update(medicines => [
      ...(medicines ?? []),
      medicine
    ]);
  }

  /**
   * Actualizar un medicamento localmente
   */
  updateMedicineLocal(id: string, medicine: Partial<Medicine>) {
    this.medicinesSignal.update(medicines =>
      medicines?.map(m => m.id === id ? { ...m, ...medicine } : m) ?? null
    );
  }

  /**
   * Eliminar un medicamento localmente
   */
  removeMedicineLocal(id: string) {
    this.medicinesSignal.update(medicines =>
      medicines?.filter(m => m.id !== id) ?? null
    );
  }

  /**
   * Cargar usuarios
   */
  loadUsers() {
    if (this.userLoadingSignal()) return;

    this.userLoadingSignal.set(true);
    this.userErrorSignal.set(null);

    this.userService.getUsers().subscribe({
      next: (users: any) => {
        this.usersSignal.set(users);
        this.userLoadingSignal.set(false);
      },
      error: (err: any) => {
        this.userErrorSignal.set(err.message || 'Error cargando usuarios');
        this.userLoadingSignal.set(false);
      }
    });
  }

  /**
   * Seleccionar un usuario
   */
  selectUser(user: User | null) {
    this.selectedUserSignal.set(user);
  }

  /**
   * Actualizar búsqueda
   */
  setSearchQuery(query: string) {
    this.searchQuerySignal.set(query);
  }

  /**
   * Alternar sidebar
   */
  toggleSidebar() {
    this.sidebarOpenSignal.update(open => !open);
  }

  /**
   * Establecer tema
   */
  setDarkMode(dark: boolean) {
    this.darkModeSignal.set(dark);
  }

  /**
   * Limpiar estado (logout)
   */
  reset() {
    this.medicinesSignal.set(null);
    this.medicineErrorSignal.set(null);
    this.medicineLoadingSignal.set(false);
    this.usersSignal.set(null);
    this.userErrorSignal.set(null);
    this.userLoadingSignal.set(false);
    this.selectedUserSignal.set(null);
    this.searchQuerySignal.set('');
    this.sidebarOpenSignal.set(false);
  }
}
