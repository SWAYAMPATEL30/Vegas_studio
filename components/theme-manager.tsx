"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from '@/lib/theme-context'
import { Save, RefreshCcw, Palette, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'

const DEFAULT_THEME = {
  primary: '#FDB400',
  secondary: '#9AC138',
  background: '#1A2722',
  foreground: '#FFFFFF',
  accent: '#7B9A2D',
  headerBg: '#1A2722',
  footerBg: '#1A2722',
  cardBg: '#1A2722',
  buttonText: '#1A2722',
  headingColor: '#FFFFFF'
}

export function ThemeManager() {
  const { theme, updateTheme } = useTheme()
  const [localTheme, setLocalTheme] = useState(DEFAULT_THEME)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    if (theme) {
      setLocalTheme(theme)
    }
  }, [theme])

  const handleColorChange = (key: string, value: string) => {
    setLocalTheme(prev => ({ ...prev, [key]: value }))
  }

  const handleSave = async () => {
    setSaving(true)
    setMessage(null)
    try {
      await updateTheme(localTheme)
      setMessage({ type: 'success', text: 'Tema guardado correctamente' })
    } catch (error) {
      setMessage({ type: 'error', text: 'Error al guardar el tema' })
    } finally {
      setSaving(false)
    }
  }

  const handleResetToDefault = () => {
    setLocalTheme(DEFAULT_THEME)
    setMessage({ type: 'success', text: 'Valores predeterminados cargados. No olvides guardar.' })
  }

  const ColorPicker = ({ label, prop }: { label: string, prop: keyof typeof DEFAULT_THEME }) => (
    <div className="space-y-2">
      <label className="text-sm font-medium text-gray-700 block">{label}</label>
      <div className="flex items-center gap-3">
        <input 
          type="color" 
          value={localTheme[prop]}
          onChange={(e) => handleColorChange(prop, e.target.value)}
          className="w-10 h-10 rounded-lg cursor-pointer border border-gray-200 p-1 bg-white shadow-sm"
        />
        <input 
          type="text" 
          value={localTheme[prop]}
          onChange={(e) => handleColorChange(prop, e.target.value)}
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm uppercase font-mono focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none text-gray-900 bg-white"
        />
      </div>
    </div>
  )

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-50 rounded-lg">
              <Palette className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Personalización de Colores</h2>
              <p className="text-sm text-gray-500">Ajusta cada detalle visual de tu barbería</p>
            </div>
          </div>
          <button
            onClick={handleResetToDefault}
            className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-600 transition-colors font-medium border border-gray-200 px-4 py-2 rounded-lg hover:border-red-200 hover:bg-red-50"
          >
            <RefreshCcw className="w-4 h-4" />
            Restablecer por defecto
          </button>
        </div>

        <div className="space-y-10">
          {/* General Colors */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-2 h-6 bg-yellow-500 rounded-full" />
              Colores Generales
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ColorPicker label="Fondo Principal" prop="background" />
              <ColorPicker label="Texto Principal" prop="foreground" />
              <ColorPicker label="Títulos/Encabezados" prop="headingColor" />
            </div>
          </div>

          {/* Branding & Buttons */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-2 h-6 bg-green-500 rounded-full" />
              Identidad y Botones
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ColorPicker label="Color Primario" prop="primary" />
              <ColorPicker label="Color Secundario" prop="secondary" />
              <ColorPicker label="Color de Acento" prop="accent" />
              <ColorPicker label="Texto en Botones" prop="buttonText" />
            </div>
          </div>

          {/* Header, Footer & Components */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2 text-gray-800">
              <span className="w-2 h-6 bg-blue-500 rounded-full" />
              Secciones y Componentes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <ColorPicker label="Fondo de Encabezado" prop="headerBg" />
              <ColorPicker label="Fondo de Pie de página" prop="footerBg" />
              <ColorPicker label="Fondo de Tarjetas" prop="cardBg" />
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <button
            onClick={handleSave}
            disabled={saving}
            className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-white px-8 py-3 rounded-xl font-bold text-lg transition-all disabled:opacity-50 shadow-lg shadow-yellow-500/20 active:scale-95"
          >
            {saving ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <Save className="w-6 h-6" />
            )}
            Guardar Todos los Cambios
          </button>
        </div>

        {message && (
          <div className={`mt-6 p-4 rounded-xl text-sm font-bold text-center animate-in fade-in slide-in-from-top-2 border ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border-green-100 shadow-sm shadow-green-100' : 'bg-red-50 text-red-700 border-red-100'
          }`}>
            {message.type === 'success' && <CheckCircle className="w-4 h-4 inline mr-2" />}
            {message.type === 'error' && <AlertCircle className="w-4 h-4 inline mr-2" />}
            {message.text}
          </div>
        )}
      </div>

      {/* Modern Preview Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Vista Previa en Tiempo Real</h3>
        <div className="rounded-2xl overflow-hidden border border-gray-200" style={{ background: localTheme.background }}>
          {/* Mock Header */}
          <div className="p-4 flex items-center justify-between border-b" style={{ background: localTheme.headerBg, borderColor: `rgba(255,255,255,0.1)` }}>
            <div className="w-24 h-6 rounded" style={{ background: localTheme.foreground, opacity: 0.2 }} />
            <div className="flex gap-4">
              <div className="w-12 h-4 rounded" style={{ background: localTheme.foreground, opacity: 0.2 }} />
              <div className="w-12 h-4 rounded" style={{ background: localTheme.foreground, opacity: 0.2 }} />
            </div>
          </div>
          
          <div className="p-10 space-y-8">
            <h2 className="text-3xl font-bold text-center" style={{ color: localTheme.headingColor }}>
              Nuestros Títulos
            </h2>
            
            <p className="text-center max-w-md mx-auto" style={{ color: localTheme.foreground, opacity: 0.8 }}>
              Este es un ejemplo de cómo se verá el texto principal en tu sitio web con los colores seleccionados.
            </p>

            <div className="grid grid-cols-2 gap-6">
              <div className="p-6 rounded-2xl border transition-all" style={{ background: localTheme.cardBg, borderColor: localTheme.accent }}>
                <div className="w-8 h-8 rounded-lg mb-4" style={{ background: localTheme.secondary }} />
                <h4 className="font-bold mb-2" style={{ color: localTheme.headingColor }}>Servicio Premium</h4>
                <div className="flex items-center justify-between mt-6">
                  <div className="w-12 h-6 border rounded" style={{ borderColor: localTheme.secondary }} />
                  <button className="w-8 h-8 rounded-full shadow-lg" style={{ background: localTheme.secondary }} />
                </div>
              </div>

              <div className="flex flex-col gap-4 justify-center items-center p-6 bg-white/5 rounded-2xl">
                <button className="w-full py-2 px-6 rounded-lg font-bold" style={{ background: localTheme.primary, color: localTheme.buttonText }}>
                  Reservar Ahora
                </button>
                <button className="w-full py-2 px-6 rounded-lg font-bold border" style={{ borderColor: localTheme.secondary, color: localTheme.secondary }}>
                  Ver Mas
                </button>
              </div>
            </div>
          </div>

          {/* Mock Footer */}
          <div className="p-8 text-center border-t" style={{ background: localTheme.footerBg, borderColor: `rgba(255,255,255,0.1)` }}>
            <div className="w-32 h-4 rounded mx-auto mb-2" style={{ background: localTheme.foreground, opacity: 0.2 }} />
            <p className="text-xs" style={{ color: localTheme.foreground, opacity: 0.5 }}>© 2026 Vegas Estudio. Todos los derechos reservados.</p>
          </div>
        </div>
      </div>
    </div>
  )
}
