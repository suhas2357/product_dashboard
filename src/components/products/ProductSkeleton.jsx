import { memo } from 'react';

const SKELETON_COUNT = 8;

const SkeletonBar = ({ className = '' }) => (
  <div className={`bg-gray-200 rounded animate-pulse ${className}`} />
);

const SkeletonRow = () => (
  <tr className="border-b border-gray-100">
    <td className="py-3 px-4">
      <div className="w-12 h-12 bg-gray-200 rounded-md animate-pulse" />
    </td>
    <td className="py-3 px-4">
      <SkeletonBar className="h-4 w-48 mb-2" />
      <SkeletonBar className="h-3 w-24" />
    </td>
    <td className="py-3 px-4"><SkeletonBar className="h-4 w-20" /></td>
    <td className="py-3 px-4"><SkeletonBar className="h-4 w-16" /></td>
    <td className="py-3 px-4"><SkeletonBar className="h-4 w-12" /></td>
    <td className="py-3 px-4"><SkeletonBar className="h-4 w-10" /></td>
    <td className="py-3 px-4"><SkeletonBar className="h-4 w-20" /></td>
  </tr>
);

const SkeletonCard = () => (
  <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col">
    <div className="flex gap-3">
      <div className="w-20 h-20 bg-gray-200 rounded-md animate-pulse" />
      <div className="flex-1 min-w-0">
        <SkeletonBar className="h-4 w-3/4 mb-2" />
        <SkeletonBar className="h-3 w-1/2 mb-2" />
        <SkeletonBar className="h-4 w-1/3" />
      </div>
    </div>
    <div className="flex items-center justify-between mt-3">
      <SkeletonBar className="h-3 w-12" />
      <SkeletonBar className="h-3 w-16" />
    </div>
    <div className="flex gap-3 mt-4 pt-3 border-t border-gray-100">
      <SkeletonBar className="h-3 w-10" />
      <SkeletonBar className="h-3 w-12" />
    </div>
  </div>
);

const ProductSkeleton = () => (
  <div aria-busy="true" aria-live="polite">
    <span className="sr-only">Loading products…</span>

    {/* Desktop */}
    <div className="hidden md:block overflow-x-auto bg-white rounded-lg border border-gray-200">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-xs uppercase">
          <tr>
            <th className="py-3 px-4">Image</th>
            <th className="py-3 px-4">Title</th>
            <th className="py-3 px-4">Category</th>
            <th className="py-3 px-4">Price</th>
            <th className="py-3 px-4">Rating</th>
            <th className="py-3 px-4">Stock</th>
            <th className="py-3 px-4">Actions</th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
            <SkeletonRow key={i} />
          ))}
        </tbody>
      </table>
    </div>

    {/* Mobile */}
    <div className="md:hidden grid grid-cols-1 gap-3">
      {Array.from({ length: 4 }).map((_, i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  </div>
);

export default memo(ProductSkeleton);