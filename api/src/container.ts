// ─────────────────────────────────────────────────────────────────────────────
// Composition Root (Dependency Injection Container)
// Wires all infrastructure adapters, handlers, and the Command/Query Buses.
// Controllers interact solely via commandBus and queryBus.
// ─────────────────────────────────────────────────────────────────────────────

import { MongoProductRepository } from './infrastructure/database/mongoProductRepository';
import { MongoOrderRepository } from './infrastructure/database/mongoOrderRepository';
import { RabbitMqPublisher } from './infrastructure/messaging/rabbitMqPublisher';

import { CommandBus } from './application/bus/commandBus';
import { QueryBus } from './application/bus/queryBus';

import { CreateOrderCommand } from './application/commands/createOrder.command';
import { CreateOrderHandler } from './application/commands/createOrder.handler';
import { CreateProductCommand } from './application/commands/createProduct.command';
import { CreateProductHandler } from './application/commands/createProduct.handler';
import { UpdateProductCommand } from './application/commands/updateProduct.command';
import { UpdateProductHandler } from './application/commands/updateProduct.handler';

import { GetOrderByIdQuery } from './application/queries/getOrderById.query';
import { GetOrderByIdHandler } from './application/queries/getOrderById.handler';
import { GetProductByIdQuery } from './application/queries/getProductById.query';
import { GetProductByIdHandler } from './application/queries/getProductById.handler';
import { ListProductsQuery } from './application/queries/listProducts.query';
import { ListProductsHandler } from './application/queries/listProducts.handler';

// ── Infrastructure Adapters (singletons) ─────────────────────────────────────
const productRepo = new MongoProductRepository();
const orderRepo = new MongoOrderRepository();
const eventPublisher = new RabbitMqPublisher();

// ── Handlers ─────────────────────────────────────────────────────────────────
export const createOrderHandler = new CreateOrderHandler(productRepo, orderRepo, eventPublisher);
export const createProductHandler = new CreateProductHandler(productRepo);
export const updateProductHandler = new UpdateProductHandler(productRepo);

export const getOrderByIdHandler = new GetOrderByIdHandler(orderRepo);
export const getProductByIdHandler = new GetProductByIdHandler(productRepo);
export const listProductsHandler = new ListProductsHandler(productRepo);

// ── Command Bus ──────────────────────────────────────────────────────────────
export const commandBus = new CommandBus();
commandBus.register(CreateOrderCommand.COMMAND_TYPE, createOrderHandler);
commandBus.register(CreateProductCommand.COMMAND_TYPE, createProductHandler);
commandBus.register(UpdateProductCommand.COMMAND_TYPE, updateProductHandler);

// ── Query Bus ────────────────────────────────────────────────────────────────
export const queryBus = new QueryBus();
queryBus.register(GetOrderByIdQuery.QUERY_TYPE, getOrderByIdHandler);
queryBus.register(GetProductByIdQuery.QUERY_TYPE, getProductByIdHandler);
queryBus.register(ListProductsQuery.QUERY_TYPE, listProductsHandler);
