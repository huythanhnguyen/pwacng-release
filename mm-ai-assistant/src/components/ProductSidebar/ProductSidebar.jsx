import React, { useState, useEffect } from 'react';
import { Card, List, Button, Empty, Spin, Image } from 'antd';
import { CloseOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import './ProductSidebar.scss';

const ProductSidebar = ({ productKeywords, showProducts, setShowProducts, onClose }) => {
  const { formatMessage } = useIntl();
  const [activeKeyword, setActiveKeyword] = useState(null);

  useEffect(() => {
    if (productKeywords && Array.isArray(productKeywords.queries) && productKeywords.queries.length > 0) {
      setActiveKeyword(productKeywords.queries[0]);
    } else {
      setActiveKeyword(null);
    }
  }, [productKeywords]);

  const getProductsForKeyword = (kw) => {
    if (!productKeywords || !Array.isArray(productKeywords.pairs)) return [];
    const pair = productKeywords.pairs.find((p) => p && p.query === kw);
    return pair && Array.isArray(pair.data) ? pair.data : [];
  };

  const handleKeywordClick = (kw) => {
    const products = getProductsForKeyword(kw);
    setShowProducts(products || []);
    setActiveKeyword(kw);
  };

  const handleProductClick = (product) => {
    // Navigate to product detail page
    if (product.url) {
      window.open(product.url, '_blank');
    }
  };

  return (
    <div className="product-sidebar">
      {onClose && (
        <div className="sidebar-header">
          <Button type="text" icon={<CloseOutlined />} onClick={onClose} />
        </div>
      )}

      {productKeywords && Array.isArray(productKeywords.queries) && productKeywords.queries.length > 0 && (
        <div className="keyword-list">
          {productKeywords.queries.map((kw) => {
            const isActive = activeKeyword === kw;
            return (
              <Button
                key={kw}
                type={isActive ? 'primary' : 'default'}
                size="small"
                onClick={() => handleKeywordClick(kw)}
                className={`keyword-button ${isActive ? 'active' : ''}`}
              >
                {kw}
              </Button>
            );
          })}
        </div>
      )}

      <div className="product-list">
        {showProducts && showProducts.length > 0 ? (
          <List
            grid={{ gutter: 16, column: 1 }}
            dataSource={showProducts}
            renderItem={(product) => (
              <List.Item>
                <Card
                  hoverable
                  onClick={() => handleProductClick(product)}
                  cover={
                    product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name || product.ecom_name}
                        preview={false}
                        style={{ height: 150, objectFit: 'cover' }}
                      />
                    ) : null
                  }
                >
                  <Card.Meta
                    title={product.name || product.ecom_name}
                    description={
                      <div>
                        {product.sku && (
                          <div style={{ fontSize: '12px', color: '#999', marginBottom: '4px' }}>
                            SKU: {product.sku}
                          </div>
                        )}
                        {product.price && (
                          <div style={{ fontSize: '16px', fontWeight: 'bold', color: '#1890ff' }}>
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: product.currency || 'VND'
                            }).format(product.price)}
                          </div>
                        )}
                      </div>
                    }
                  />
                </Card>
              </List.Item>
            )}
          />
        ) : (
          <Empty
            description={formatMessage({
              id: 'chatbot.noProductForKey',
              defaultMessage: 'No products found matching the keyword'
            })}
            style={{ marginTop: 40 }}
          />
        )}
      </div>
    </div>
  );
};

export default ProductSidebar;

