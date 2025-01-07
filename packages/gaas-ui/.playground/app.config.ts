export default defineAppConfig({
  gaasUi: {
    name: 'Gaas UI (overwritten)',
  },
  toaster: {
    position: 'bottom-right' as const,
    expand: true,
    duration: 5000,
  },
})
