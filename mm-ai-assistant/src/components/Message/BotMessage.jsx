import React, { memo } from 'react';
import { Button, Card, List, Typography } from 'antd';
import { ShoppingCartOutlined, CheckoutOutlined, CustomerServiceOutlined } from '@ant-design/icons';
import { useIntl } from 'react-intl';
import { parseJsonMessage } from '../../utils/messageParser';
import './Message.scss';

const { Text, Paragraph } = Typography;

const BotMessage = memo(
  ({
    html,
    closingHtml,
    cta,
    skus,
    cart,
    order,
    keywords,
    keywordsData,
    setShowProducts,
    setFullscreen,
    setProductKeywords,
    handleSelectSuggestion,
    renderContent
  }) => {
    const { formatMessage } = useIntl();

    if (!html) return null;

    const orderInfo = order?.[0] ? order?.[0]?.items || order : null;

    const handleCTAClick = (type) => {
      switch (type) {
        case 'cartCTA':
          // Navigate to cart
          window.location.href = '/cart';
          break;
        case 'checkoutCTA':
          // Navigate to checkout
          window.location.href = '/checkout';
          break;
        case 'supportCTA':
          // Open support
          break;
        default:
          break;
      }
    };

    return (
      <div className="bot-message">
        <div className="bot-avatar">
          <span className="avatar-icon">🤖</span>
        </div>
        <div className="message-content">
          <div className="message-text">{renderContent(html)}</div>

          {cart?.[0]?.items?.length ? (
            <Card size="small" className="cart-info">
              <List
                dataSource={cart[0].items}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <Text strong>{item.product.ecom_name || item.product.name}</Text>
                      <br />
                      <Text type="secondary">SKU: {item.product.art_no || item.product.sku}</Text>
                      {item.prices?.price_including_tax && (
                        <>
                          <br />
                          <Text>
                            {formatMessage({ id: 'chatbot.price', defaultMessage: 'Price' })}:{' '}
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: item.prices.price_including_tax.currency || 'VND'
                            }).format(item.prices.price_including_tax.value)}
                          </Text>
                        </>
                      )}
                      {item.quantity && (
                        <>
                          <br />
                          <Text>
                            {formatMessage({ id: 'chatbot.qty', defaultMessage: 'Quantity' })}: {item.quantity}
                          </Text>
                        </>
                      )}
                    </div>
                  </List.Item>
                )}
              />
              {cart[0].total && (
                <div className="cart-total">
                  <Text strong>
                    {formatMessage({ id: 'chatbot.cartTotal', defaultMessage: 'Estimated total payment: ' })}
                    {new Intl.NumberFormat('vi-VN', {
                      style: 'currency',
                      currency: cart[0].total.currency || 'VND'
                    }).format(cart[0].total.value)}
                  </Text>
                </div>
              )}
              <div className="cart-note">
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  {formatMessage({
                    id: 'chatbot.cartInfo',
                    defaultMessage:
                      'Does not include shipping fees. For exact details, please choose payment to apply full promotions and shipping fees.'
                  })}
                </Text>
              </div>
            </Card>
          ) : null}

          {orderInfo?.length ? (
            <Card size="small" className="order-info">
              <List
                dataSource={orderInfo}
                renderItem={(item) => (
                  <List.Item>
                    <div>
                      <Text strong>{item.product?.name || item.name}</Text>
                      {item.prices?.price_including_tax && (
                        <>
                          <br />
                          <Text>
                            {formatMessage({ id: 'chatbot.price', defaultMessage: 'Price' })}:{' '}
                            {new Intl.NumberFormat('vi-VN', {
                              style: 'currency',
                              currency: item.prices.price_including_tax.currency || 'VND'
                            }).format(item.prices.price_including_tax.value)}
                          </Text>
                        </>
                      )}
                    </div>
                  </List.Item>
                )}
              />
            </Card>
          ) : null}

          {closingHtml && <div className="closing-message">{renderContent(closingHtml)}</div>}

          {cta && cta.length > 0 && (
            <div className="cta-buttons">
              {cta.includes('cartCTA') && (
                <Button
                  type="primary"
                  icon={<ShoppingCartOutlined />}
                  onClick={() => handleCTAClick('cartCTA')}
                >
                  {formatMessage({ id: 'chatbot.viewCart', defaultMessage: 'View cart details' })}
                </Button>
              )}
              {cta.includes('checkoutCTA') && (
                <Button
                  type="primary"
                  icon={<CheckoutOutlined />}
                  onClick={() => handleCTAClick('checkoutCTA')}
                >
                  {formatMessage({ id: 'chatbot.viewCheckout', defaultMessage: 'Pay now' })}
                </Button>
              )}
              {cta.includes('supportCTA') && (
                <Button icon={<CustomerServiceOutlined />} onClick={() => handleCTAClick('supportCTA')}>
                  {formatMessage({ id: 'global.support', defaultMessage: 'Support' })}
                </Button>
              )}
            </div>
          )}

          {keywords?.queries?.length > 0 && (
            <div className="keywords-section">
              <Button
                type="link"
                onClick={() => {
                  setProductKeywords(keywords);
                  setShowProducts(keywords.pairs[0]?.data || []);
                  setFullscreen(true);
                }}
              >
                {formatMessage({ id: 'chatbot.moreProducts', defaultMessage: 'View more products' })}
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  }
);

BotMessage.displayName = 'BotMessage';

export default BotMessage;

