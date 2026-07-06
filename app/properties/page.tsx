// app/properties/page.tsx
import { Suspense } from 'react';
import { PropertyFilters } from '@/features/search/components/property-filters';
import { PropertyGrid } from '@/features/search/components/property-grid';
import { PropertyList } from '@/features/search/components/property-list';
import { PropertyPagination } from '@/features/search/components/property-pagination';

interface PageProps {
  searchParams: {
    page?: string;
    city?: string;
    area?: string;
    propertyType?: string;
    minPrice?: string;
    maxPrice?: string;
    beds?: string;
    baths?: string;
    sort?: string;
    view?: 'grid' | 'list';
  };
}

export default function PropertiesPage({ searchParams }: PageProps) {
  const page = parseInt(searchParams.page || '1');
  const view = searchParams.view || 'grid';

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        <aside className="lg:w-80 flex-shrink-0">
          <Suspense fallback={<div>Loading filters...</div>}>
            <PropertyFilters searchParams={searchParams} />
          </Suspense>
        </aside>

        <main className="flex-1">
          <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold">Properties</h1>
            <div className="text-sm text-gray-500">
              Showing <span className="font-semibold">1</span>-<span className="font-semibold">20</span> of <span className="font-semibold">1,234</span> properties
            </div>
          </div>

          <Suspense fallback={<div>Loading properties...</div>}>
            {view === 'grid' ? (
              <PropertyGrid filters={searchParams} page={page} />
            ) : (
              <PropertyList filters={searchParams} page={page} />
            )}
          </Suspense>

          <div className="mt-8">
            <Suspense fallback={<div>Loading pagination...</div>}>
              <PropertyPagination currentPage={page} totalPages={62} />
            </Suspense>
          </div>
        </main>
      </div>
    </div>
  );
}
