import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiChevronDown, FiChevronRight, FiFolder } from 'react-icons/fi';
import SearchTreeModal from '../components/SearchTreeModal';

interface SearchTreeNode {
  id: number;
  name: string;
  slug: string;
  description?: string;
  icon?: string;
  parentId?: number;
  children?: SearchTreeNode[];
  _count?: {
    products: number;
  };
}

const SearchTree: React.FC = () => {
  const [searchTrees, setSearchTrees] = useState<SearchTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTree, setEditingTree] = useState<SearchTreeNode | null>(null);
  const [expandedNodes, setExpandedNodes] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchSearchTrees();
  }, []);

  const fetchSearchTrees = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:3000/api/search-tree/tree/root');
      if (!response.ok) {
        throw new Error('Failed to fetch search trees');
      }
      const data = await response.json();
      setSearchTrees(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTree = () => {
    setEditingTree(null);
    setIsModalOpen(true);
  };

  const handleEditTree = (tree: SearchTreeNode) => {
    setEditingTree(tree);
    setIsModalOpen(true);
  };

  const handleDeleteTree = async (tree: SearchTreeNode) => {
    if (!confirm(`Ви впевнені, що хочете видалити "${tree.name}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/search-tree/${tree.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to delete search tree');
      }

      await fetchSearchTrees();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Помилка при видаленні');
    }
  };

  const handleModalClose = () => {
    setIsModalOpen(false);
    setEditingTree(null);
  };

  const handleModalSuccess = () => {
    fetchSearchTrees();
    handleModalClose();
  };

  const toggleExpanded = (nodeId: number) => {
    const newExpanded = new Set(expandedNodes);
    if (newExpanded.has(nodeId)) {
      newExpanded.delete(nodeId);
    } else {
      newExpanded.add(nodeId);
    }
    setExpandedNodes(newExpanded);
  };

  const renderTreeNode = (node: SearchTreeNode, level: number = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const productCount = node._count?.products || 0;

    return (
      <div key={node.id} className="mb-2">
        <div 
          className="flex items-center p-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow"
          style={{ marginLeft: `${level * 20}px` }}
        >
          {/* Expand/Collapse Button */}
          {hasChildren && (
            <button
              onClick={() => toggleExpanded(node.id)}
              className="mr-2 p-1 hover:bg-gray-100 rounded"
            >
              {isExpanded ? (
                <FiChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <FiChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}

          {/* Icon */}
          <div className="mr-3">
            {node.icon ? (
              <span className="text-xl">{node.icon}</span>
            ) : hasChildren ? (
              isExpanded ? (
                <FiFolder className="w-5 h-5 text-blue-500" />
              ) : (
                <FiFolder className="w-5 h-5 text-blue-500" />
              )
            ) : (
              <div className="w-5 h-5 bg-gray-300 rounded"></div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{node.name}</h3>
                {node.description && (
                  <p className="text-sm text-gray-600 mt-1">{node.description}</p>
                )}
                <div className="flex items-center mt-1 text-xs text-gray-500">
                  <span>Товарів: {productCount}</span>
                  {hasChildren && (
                    <span className="ml-3">Підкатегорій: {node.children?.length}</span>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEditTree(node)}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                  title="Редагувати"
                >
                  <FiEdit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDeleteTree(node)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Видалити"
                >
                  <FiTrash2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => {
                    setEditingTree({ ...node, parentId: node.id });
                    setIsModalOpen(true);
                  }}
                  className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                  title="Додати підкатегорію"
                >
                  <FiPlus className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Children */}
        {hasChildren && isExpanded && (
          <div className="mt-2">
            {node.children?.map((child, index) => (
              <React.Fragment key={`${node.id}-child-${child.id}-${index}`}>
                {renderTreeNode(child, level + 1)}
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Помилка: {error}</p>
        <button
          onClick={fetchSearchTrees}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Спробувати знову
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Дерево пошуку товарів</h1>
          <p className="text-gray-600 mt-1">
            Керування категоріями та підкатегоріями для пошуку товарів
          </p>
        </div>
        <button
          onClick={handleCreateTree}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4 mr-2" />
          Додати категорію
        </button>
      </div>

      {/* Tree View */}
      <div className="space-y-4">
        {searchTrees.length === 0 ? (
          <div className="text-center py-12">
            <FiFolder className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Немає категорій
            </h3>
            <p className="text-gray-600 mb-4">
              Створіть першу категорію для початку роботи з деревом пошуку
            </p>
            <button
              onClick={handleCreateTree}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Створити категорію
            </button>
          </div>
        ) : (
          searchTrees.map((tree, index) => renderTreeNode(tree))
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <SearchTreeModal
          tree={editingTree}
          onClose={handleModalClose}
          onSuccess={handleModalSuccess}
        />
      )}
    </div>
  );
};

export default SearchTree;