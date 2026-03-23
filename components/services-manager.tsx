'use client'

import React from "react"
import { useState } from 'react'
import { Trash2, Edit2, Plus, Loader2, Upload, ImageIcon } from 'lucide-react'
import { uploadServiceImage } from '@/lib/supabase-admin'
import Image from 'next/image'

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
      descriptions: service.descriptions.join(', '),
      duration_minutes: service.duration_minutes.toString(),
      type: service.type,
      image_url: service.image_url || '',
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

      if (selectedFile) {
        uploadedUrl = await uploadServiceImage(selectedFile) || ''
      }

      const serviceData = {
        name: formData.name,
        price: Number(formData.price),
        descriptions: formData.descriptions.split(',').map((d) => d.trim()).filter(Boolean),
        duration_minutes: Number(formData.duration_minutes),
        type: formData.type,
        image_url: uploadedUrl,
      }

      if (editingId) {
        await onUpdateService(editingId, {
          name: serviceData.name,
          price: serviceData.price,
          descriptions: serviceData.descriptions,
          duration_minutes: serviceData.duration_minutes,
          image_url: serviceData.image_url,
          type: serviceData.type
        })
      } else {
        await onAddService(serviceData)
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
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all"
            style={{ background: '#FDB400', color: '#1A2722' }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '0.9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '1'
            }}
          >
            <Plus className="w-4 h-4" />
            Agregar servicio
          </button>
        )}
      </div>

      {/* Add/Edit Form */}
      {showForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h4 className="text-lg font-semibold mb-4" style={{ color: '#1A2722' }}>
            {editingId ? 'Editar servicio' : 'Nuevo servicio'}
          </h4>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Nombre *
                </label>
                <input
                  type="text"
                  style={{ color: "black" }}
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="ej: Corte de cabello"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  disabled={false}
                />
                {false && (
                  <p className="text-xs text-muted-foreground mt-1">El nombre no se puede modificar</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Precio (COP) *
                </label>
                <input
                  type="number"
                  style={{ color: "black" }}
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="ej: 25000"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Duración (minutos) *
                </label>
                <input
                  type="number"
                  style={{ color: "black" }}
                  value={formData.duration_minutes}
                  onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                  placeholder="ej: 30"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-gray-700">
                  Tipo
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                  style={{ color: "black" }}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="individual">Individual</option>
                  <option value="combo">Combo</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Descripciones (separadas por coma)
              </label>
              <textarea
                value={formData.descriptions}
                onChange={(e) => setFormData({ ...formData, descriptions: e.target.value })}
                style={{ color: "black" }}
                placeholder="ej: Corte profesional, Lavado incluido, Cera caliente"
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500"
                disabled={false}
              />
              {false && (
                <p className="text-xs text-muted-foreground mt-1">Las descripciones no se pueden modificar</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-2 text-gray-700">
                Imagen del servicio (Opcional)
              </label>
              <div className="flex items-center gap-4">
                {(selectedFile || formData.image_url) && (
                  <div className="relative w-16 h-16 rounded overflow-hidden border">
                    <Image 
                      src={selectedFile ? URL.createObjectURL(selectedFile) : formData.image_url} 
                      alt="Preview" 
                      fill 
                      className="object-cover"
                    />
                  </div>
                )}
                <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-sm hover:bg-gray-100 text-gray-800 font-medium">
                  <Upload className="w-4 h-4" />
                  <span>{editingId ? 'Cambiar imagen' : 'Subir imagen'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                  />
                </label>
                {selectedFile && (
                  <span className="text-xs text-gray-500 truncate max-w-xs">{selectedFile.name}</span>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading || uploading}
                className="flex-1 px-4 py-2 rounded-lg text-white font-medium transition-all flex items-center justify-center gap-2"
                style={{ background: '#9AC138' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.opacity = '0.9'
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.opacity = '1'
                }}
              >
                {(loading || uploading) && <Loader2 className="w-4 h-4 animate-spin" />}
                {editingId ? 'Actualizar' : 'Crear'} servicio
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  resetForm()
                }}
                className="flex-1 px-4 py-2 rounded-lg border border-gray-300 text-gray-800 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Services List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {services.length === 0 ? (
          <p className="text-center text-muted-foreground col-span-full">
            No hay servicios disponibles
          </p>
        ) : (
          services.map((service) => (
            <div
              key={service.id}
              className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2">
                  {service.image || service.image_url ? (
                    <div className="relative w-8 h-8 rounded overflow-hidden">
                      <Image src={service.image || service.image_url || ''} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                    </div>
                  )}
                  <h4 className="font-semibold text-sm" style={{ color: '#1A2722' }}>
                    {service.name}
                  </h4>
                </div>
                <span
                  className="text-xs px-2 py-1 rounded font-medium"
                  style={{
                    background: service.type === 'combo' ? '#FDB400' : '#E5E7EB',
                    color: service.type === 'combo' ? '#1A2722' : '#6B7280',
                  }}
                >
                  {service.type === 'combo' ? 'Combo' : 'Individual'}
                </span>
              </div>

              <div className="mb-3">
                {service.descriptions.map((desc, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground">
                    • {desc}
                  </p>
                ))}
              </div>

              <div className="flex items-center justify-between mb-4 text-sm">
                <span className="font-bold text-lg" style={{ color: '#1A2722' }}>
                  ${service.price.toLocaleString('es-CO')}
                </span>
                <span className="text-muted-foreground">{service.duration_minutes} min</span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => onUpdateService(service.id, { is_active: !service.is_active })}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all border shadow-sm"
                  style={{ 
                    backgroundColor: service.is_active ? '#ecfdf5' : '#fef2f2',
                    borderColor: service.is_active ? '#a7f3d0' : '#fecaca',
                    color: service.is_active ? '#065f46' : '#991b1b'
                  }}
                >
                  {service.is_active ? 'Visible' : 'Oculto'}
                </button>
                <button
                  onClick={() => handleEdit(service)}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all"
                  style={{ background: '#FDB400', color: '#1A2722' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.opacity = '0.9'
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.opacity = '1'
                  }}
                >
                  <Edit2 className="w-3 h-3" />
                  Editar
                </button>
                <button
                  onClick={() => {
                    if (confirm('¿Eliminar este servicio?')) {
                      onDeleteService(service.id)
                    }
                  }}
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-1.5 rounded text-sm font-medium transition-all text-red-600 border border-red-200 hover:bg-red-50"
                >
                  <Trash2 className="w-3 h-3" />
                  Eliminar
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  )
}