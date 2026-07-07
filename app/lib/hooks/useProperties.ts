'use client'
import useSWR from 'swr'
import { getProperties, getProperty } from '../api-client'

const fetcher = (url: string) => fetch(url).then(r => r.json())

export function useProperties(params?: string) {
  const { data, error, mutate } = useSWR(
    `/api/properties${params ? `?${params}` : ''}`, 
    fetcher
  )
  
  return {
    properties: data?.data || [],
    loading: !error && !data,
    error,
    mutate
  }
}

export function useProperty(id: string) {
  const { data, error } = useSWR(
    id ? `/api/properties/${id}` : null,
    fetcher
  )
  
  return {
    property: data?.data,
    loading: !error && !data,
    error
  }
}
