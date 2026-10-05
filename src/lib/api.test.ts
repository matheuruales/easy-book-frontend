import { beforeEach, describe, expect, it } from 'vitest'
import { api } from './api'
import { SESSION_STORAGE_KEY } from './session'

describe('cliente API autenticado', () => {
  beforeEach(() => sessionStorage.clear())

  it('envía el token guardado por el contexto de autenticación', async () => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ token: 'token-de-prueba' }))
    let authorization: unknown
    await api.get('/prueba', {
      adapter: async (config) => {
        authorization = config.headers.Authorization
        return { data: null, status: 200, statusText: 'OK', headers: {}, config }
      },
    })

    expect(authorization).toBe('Bearer token-de-prueba')
  })
})
