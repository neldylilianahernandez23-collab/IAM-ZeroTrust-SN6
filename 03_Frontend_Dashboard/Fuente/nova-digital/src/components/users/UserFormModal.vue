<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
  >
    <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl dark:bg-slate-800">
      <div class="flex items-center justify-between border-b pb-3 dark:border-slate-700">
        <h3 class="text-lg font-bold text-slate-800 dark:text-white">Crear Nuevo Usuario</h3>
        <button
          @click="closeModal"
          class="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
        >
          ✕
        </button>
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-600 dark:bg-red-900/30 dark:text-red-400"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >Correo Electrónico</label
          >
          <input
            v-model="formData.email"
            type="email"
            required
            placeholder="usuario@dominio.com"
            class="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >Contraseña Temporal</label
          >
          <input
            v-model="formData.password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >Nombre</label
            >
            <input
              v-model="formData.given_name"
              type="text"
              placeholder="Juan"
              class="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
              >Apellido</label
            >
            <input
              v-model="formData.family_name"
              type="text"
              placeholder="Pérez"
              class="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-700 dark:text-slate-300"
            >Rol Inicial</label
          >
          <select
            v-model="formData.role"
            class="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm focus:border-indigo-500 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <template v-if="availableRoles.length > 0">
              <option v-for="r in availableRoles" :key="r.id || r.name" :value="r.name">
                {{ r.name }}
              </option>
            </template>
            <template v-else>
              <option value="Administrador">Administrador</option>
              <option value="Auditor">Auditor</option>
              <option value="Docente">Docente</option>
              <option value="Estudiante">Estudiante</option>
            </template>
          </select>
        </div>

        <div class="flex justify-end gap-3 pt-4">
          <button
            type="button"
            @click="closeModal"
            class="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
          >
            {{ loading ? 'Guardando...' : 'Crear Usuario' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, watch } from 'vue';

interface Role {
  id?: string;
  name: string;
  description?: string;
}

const props = withDefaults(
  defineProps<{
    isOpen: boolean;
    availableRoles?: Role[];
  }>(),
  {
    availableRoles: () => []
  }
);

const emit = defineEmits<{
  (e: 'close'): void;
  (e: 'userCreated', user: any): void;
}>();

const loading = ref(false);
const error = ref('');

const formData = reactive({
  email: '',
  password: '',
  given_name: '',
  family_name: '',
  role: 'Estudiante'
});

// Actualizar rol por defecto cuando la lista de roles cargue
watch(
  () => props.availableRoles,
  (newRoles: Role[]) => {
    if (newRoles && newRoles.length > 0 && newRoles[0]?.name) {
      formData.role = newRoles[0].name;
    }
  },
  { immediate: true }
);

const closeModal = () => {
  emit('close');
};

const handleSubmit = async () => {
  loading.value = true;
  error.value = '';

  try {
    const response = await fetch('http://localhost:3000/api/users', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const data = await response.json();
      throw new Error(data.error || 'Error al crear el usuario');
    }

    const newUser = await response.json();
    emit('userCreated', newUser);
    closeModal();

    // Limpiar formulario
    formData.email = '';
    formData.password = '';
    formData.given_name = '';
    formData.family_name = '';
  } catch (err: any) {
    error.value = err.message || 'Ocurrió un error inesperado';
  } finally {
    loading.value = false;
  }
};
</script>