'use client'

import React from "react"
import { useState } from 'react'
import { Trash2, Edit2, Plus, Loader2, Upload, ImageIcon, XCircle } from 'lucide-react'
import { uploadServiceImage } from '@/lib/supabase-admin'
import Image from 'next/image'
import { useAuth } from '@/lib/auth-context'

interface Service {
  id: string
  name: string
  price: number
  descriptions: string[]
  duration_minutes: number
  type: 'individual' | 'combo'
  is_active: boolean
  image_url?: string
  image?: string | null
  created_at: string
}

interface ServicesManagerProps {
  services: Service[]
  onAddService: (service: Omit<Service, 'id' | 'is_active' | 'created_at'>) => Promise<void>
  onUpdateService: (id: string, service: Partial<Service>) => Promise<void>
  onDeleteService: (id: string) => Promise<void>
  loading: boolean
}

export function ServicesManager({
  services,
  onAddService,
  onUpdateService,
  onDeleteService,
  loading,
}: ServicesManagerProps) {
  const { role } = useAuth()
  const isAdmin = role === 'admin'

  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    descriptions: '',
    duration_minutes: '',
    type: 'individual' as 'individual' | 'combo',
    image_url: '',
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)

  const resetForm = () => {
    setFormData({
      name: '',
      price: '',
      descriptions: '',
      duration_minutes: '',
      type: 'individual',
      image_url: '',
    })
    setSelectedFile(null)
    setEditingId(null)
  }

  const handleEdit = (service: Service) => {
    setFormData({
      name: service.name,
      price: service.price.toString(),
      descriptions: service.descriptions.join('\n'),
      duration_minutes: service.duration_minutes.toString(),
      type: service.type,
      image_url: service.image_url || service.image || '',
    })
    setEditingId(service.id)
    setShowForm(true)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.name || !formData.price || !formData.duration_minutes) {
      alert('Por favor completa los campos requeridos')
      return
    }

    try {
      setUploading(true)
      let uploadedUrl = formData.image_url

      if (selectedFile && isAdmin) {
        uploadedUrl = await uploadServiceImage(selectedFile) || ''
      }

      const descriptionsArray = formData.descriptions
        .split(/[\n,]+/)
        .map((d) => d.trim())
        .filter(Boolean)

      const serviceData = {
        name: formData.name,
        price: Number(formData.price),
        descriptions: descriptionsArray.length > 0 ? descriptionsArray : [formData.descriptions],
        duration_minutes: Number(formData.duration_minutes),
        type: formData.type,
        image_url: uploadedUrl || null,
      }

      if (editingId) {
        await onUpdateService(editingId, serviceData)
      } else {
        await onAddService(serviceData as any)
      }

      resetForm()
      setShowForm(false)
    } catch (error) {
      console.error('[v0] Error saving service:', error)
      alert('Error al guardar servicio')
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold" style={{ color: '#1A2722' }}>
          Gestionar Servicios
        </h3>
        {!showForm && isAdmin && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: '#FDB400', color: '#1A2722' }}
          >
            <Plus className="w-4 h-4" />
            Agregar servicio
          </button>
        )}
      </div>

      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
          <h4 className="text-lg font-semibold mb-4" style={{ color: '#1A2722' }}>
            {editingId ? 'Editar servicio' : 'Nuevo servicio'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Nombre *</label>
                <input
                  type="text"
                  style={{ color: "black" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Corte de cabello"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Precio (COP) *</label>
                <input
                  type="number"
                  style={{ color: "black" }}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="ej: 25000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Duración (min) *</label>
                <input
                  type="number"
                  style={{ color: "black" }}
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Tipo</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  style={{ color: "black" }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="individual">Individual</option>
                  <option value="combo">Combo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Descripción (Puedes usar varias líneas o comas)
              </label>
              <textarea
                value={formData.descriptions}
                onChange={(e) => setFormData({ ...formData, descriptions: e.target.value })}
                style={{ color: "black" }}
                placeholder="Describe el servicio aquí..."
                rows={5}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500"
              />
            </div>

            {isAdmin && (
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">Imagen (Opcional)</label>
                <div className="flex items-center gap-4">
                  {(selectedFile || formData.image_url) && (
                    <div className="relative w-20 h-20 rounded-lg overflow-hidden border">
                      <Image 
                        src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url} 
                        alt="Preview" 
                        fill 
                        className="object-cover"
                      />
                      <button 
                        type="button" 
                        onClick={() => { setSelectedFile(null); setFormData({ ...formData, image_url: '' }) }}
                        className="absolute top-0 right-0 p-1 bg-red-600 text-white rounded-bl"
                      >
                         <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm hover:bg-gray-100 text-gray-800 font-medium">
                    <Upload className="w-4 h-4" />
                    <span>Subir imagen</span>
                    <input type="file" accept="image/*" className="hidden" onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} />
                  </label>
                </div>
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-4 py-3 rounded-xl text-white font-bold transition-all flex items-center justify-center gap-2 hover:shadow-lg disabled:opacity-50"
                style={{ background: '#9AC138' }}
              >
                {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Actualizar' : 'Crear'} servicio
              </button>
              <button
                type="button"
                onClick={() => { setShowForm(false); resetForm(); }}
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 text-gray-800 font-medium hover:bg-gray-50"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {services.map((service) => (
          <div key={service.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-xl transition-all group overflow-hidden">
            <div className="flex items-center gap-3 mb-4">
              <div className="relative w-12 h-12 rounded-lg bg-gray-50 border overflow-hidden flex-shrink-0">
                {service.image || service.image_url ? (
                  <Image src={service.image || service.image_url || ''} alt="" fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-gray-300" />
                  </div>
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-gray-900 truncate">{service.name}</h4>
                <span className="text-[10px] uppercase tracking-widest text-primary font-bold">{service.type}</span>
              </div>
            </div>

            <div className="mb-4 text-sm text-gray-600 line-clamp-3">
              {service.descriptions.join(', ')}
            </div>

            <div className="flex items-center justify-between font-bold mb-6">
              <span className="text-xl text-gray-900">${service.price.toLocaleString('es-CO')}</span>
              <span className="text-xs text-gray-400">{service.duration_minutes} min</span>
            </div>

            <div className="flex gap-2 opacity-100 lg:opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => onUpdateService(service.id, { is_active: !service.is_active })}
                className={`flex-1 py-2 rounded-lg text-xs font-bold border transition-colors ${service.is_active ? 'bg-green-50 border-green-200 text-green-700' : 'bg-red-50 border-red-200 text-red-700'}`}
              >
                {service.is_active ? 'Visible' : 'Oculto'}
              </button>
              {isAdmin && (
                <>
                  <button onClick={() => handleEdit(service)} className="flex-1 py-2 bg-yellow-400 rounded-lg text-xs font-bold text-black border border-yellow-500">Editar</button>
                  <button onClick={() => confirm('¿Eliminar?') && onDeleteService(service.id)} className="flex-1 py-2 border border-red-200 rounded-lg text-xs font-bold text-red-600">Borrar</button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}