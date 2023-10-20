import { Test } from '@nestjs/testing';

import { LoggerModule } from '@/infra/logger';
import { ICatsCreateAdapter } from '@/modules/cats/adapter';
import { ApiInternalServerException } from '@/utils/exception';
import { CatsMock } from '@/utils/tests/mocks/cats';
import { RequestMock } from '@/utils/tests/mocks/request';
import { expectZodError } from '@/utils/tests/tests';

import { ICatsRepository } from '../../repository/cats';
import { CatsCreateUsecase } from '../cats-create';

describe('CatsCreateUsecase', () => {
  let usecase: ICatsCreateAdapter;
  let repository: ICatsRepository;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      imports: [LoggerModule],
      providers: [
        {
          provide: ICatsRepository,
          useValue: {}
        },
        {
          provide: ICatsCreateAdapter,
          useFactory: (catsRepository: ICatsRepository) => {
            return new CatsCreateUsecase(catsRepository);
          },
          inject: [ICatsRepository]
        }
      ]
    }).compile();

    usecase = app.get(ICatsCreateAdapter);
    repository = app.get(ICatsRepository);
  });

  test('should throw error when invalid parameters', async () => {
    await expectZodError(
      () => usecase.execute({}, RequestMock.trancingMock),
      (issues) => {
        expect(issues).toEqual([
          { message: 'Required', path: 'name' },
          { message: 'Required', path: 'breed' },
          { message: 'Required', path: 'age' }
        ]);
      }
    );
  });

  test('should cats create successfully', async () => {
    repository.create = jest.fn().mockResolvedValue(CatsMock.catCreateMock);
    repository.startSession = jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn()
    });
    await expect(usecase.execute(CatsMock.catCreateMock, RequestMock.trancingMock)).resolves.toEqual(
      CatsMock.catCreateMock
    );
  });

  test('should throw error when create with transaction', async () => {
    repository.startSession = jest.fn().mockResolvedValue({
      commit: jest.fn(),
      rollback: jest.fn()
    });
    repository.create = jest.fn().mockRejectedValue(new ApiInternalServerException());
    await expect(usecase.execute(CatsMock.catCreateMock, RequestMock.trancingMock)).rejects.toThrow(
      ApiInternalServerException
    );
  });
});
