<template>
  <div
    v-if="isOpen"
    class="fixed inset-0 z-50 flex items-center justify-center bg-[#000613]/60 backdrop-blur-sm"
  >
    <div class="w-full max-w-md rounded-xl bg-white p-6 shadow-2xl border border-[#c4c6cf]">
      <div class="flex items-center justify-between border-b border-[#c4c6cf] pb-3">
        <h3 class="text-lg font-bold text-[#000613]">Crear Nuevo Usuario</h3>
        <button
          @click="closeModal"
          class="text-[#43474e] hover:text-[#000613] transition-colors"
        >
          ✕
        </button>
      </div>

      <div
        v-if="error"
        class="mt-4 rounded-md bg-[#ba1a1a]/10 p-3 text-sm text-[#ba1a1a]"
      >
        {{ error }}
      </div>

      <form @submit.prevent="handleSubmit" class="mt-4 space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#000613]">Correo Electrónico</label>
          <input
            v-model="formData.email"
            type="email"
            required
            placeholder="usuario@dominio.com"
            class="mt-1 w-full rounded-lg border border-[#c4c6cf] bg-[#f8f9ff] p-2 text-sm text-[#000613] focus:border-[#2f486a] focus:outline-none"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-[#000613]">Contraseña Temporal</label>
          <input
            v-model="formData.password"
            type="password"
            required
            minlength="8"
            placeholder="••••••••"
            class="mt-1 w-full rounded-lg border border-[#c4c6cf] bg-[#f8f9ff] p-2 text-sm text-[#000613] focus:border-[#2f486a] focus:outline-none"
          />
        </div>

        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="block text-sm font-medium text-[#000613]">Nombre</label>
            <input
              v-model="formData.given_name"
              type="text"
              placeholder="Juan"
              class="mt-1 w-full rounded-lg border border-[#c4c6cf] bg-[#f8f9ff] p-2 text-sm text-[#000613] focus:border-[#2f486a] focus:outline-none"
            />
          </div>
          <div>
            <label class="block text-sm font-medium text-[#000613]">Apellido</label>
            <input
              v-model="formData.family_name"
              type="text"
              placeholder="Pérez"
              class="mt-1 w-full rounded-lg border border-[#c4c6cf] bg-[#f8f9ff] p-2 text-sm text-[#000613] focus:border-[#2f486a] focus:outline-none"
            />
          </div>
        </div>

        <div>
          <label class="block text-sm font-medium text-[#000613]">Rol Inicial</label>
          <select
            v-model="formData.role"
            class="mt-1 w-full rounded-lg border border-[#c4c6cf] bg-[#f8f9ff] p-2 text-sm text-[#000613] focus:border-[#2f486a] focus:outline-none"
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
            class="rounded-lg border border-[#c4c6cf] px-4 py-2 text-sm text-[#43474e] hover:bg-[#eff4ff]"
          >
            Cancelar
          </button>
          <button
            type="submit"
            :disabled="loading"
            class="rounded-lg bg-[#000613] px-4 py-2 text-sm font-medium text-white hover:bg-[#2f486a] disabled:opacity-50 transition-colors"
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