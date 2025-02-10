<template>
  <div>
    <NuxtErrorBoundary>
      <div class="flex flex-col p-5">
        <Login />
      </div>
      <template #error="{ error, clearError }">
        <div class="py-5">
          <UAlert
            color="error"
            variant="soft"
            title="Authentication Error"
            icon="i-lucide-terminal"
          >
            <template #description>
              <div>
                {{ error }}
              </div>
              <div class="pt-2">
                <UButton
                  size="sm"
                  color="error"
                  @click="clearError"
                >
                  Login page
                </UButton>
              </div>
            </template>
          </UAlert>
        </div>
      </template>
    </NuxtErrorBoundary>
  </div>
</template>
