import { getCustomRepository, getRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}
class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionRepository);
    const cateogriesRepository = getRepository(Category);

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && balance.total < value) {
      throw new AppError('Not money for this transaction', 400);
    }

    let transactionCategory = await cateogriesRepository.findOne({
      title: category,
    });

    if (!transactionCategory) {
      transactionCategory = cateogriesRepository.create({
        title: category,
      });

      await cateogriesRepository.save(transactionCategory);
    }

    const transaction = transactionsRepository.create({
      title,
      value,
      type,
      category: transactionCategory,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
