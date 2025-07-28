import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Party } from '../entities/party.entity';
import { User } from '../entities/user.entity';
import { CreatePartyDto, UpdatePartyDto } from './dto';

@Injectable()
export class PartiesService {
  constructor(
    @InjectRepository(Party)
    private partyRepository: Repository<Party>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createPartyDto: CreatePartyDto, userId: number): Promise<Party> {
    // Check if GST number already exists
    const existingParty = await this.partyRepository.findOne({
      where: { gstNumber: createPartyDto.gstNumber },
    });

    if (existingParty) {
      throw new ConflictException('Party with this GST number already exists');
    }

    const party = this.partyRepository.create({
      ...createPartyDto,
      createdBy: userId,
    });

    return this.partyRepository.save(party);
  }

  async findAll(userId: number, userRole: string): Promise<Party[]> {
    let query = this.partyRepository
      .createQueryBuilder('party')
      .leftJoinAndSelect('party.creator', 'creator')
      .orderBy('party.createdAt', 'DESC');

    // Agents can only see parties they created
    if (userRole === 'agent') {
      query = query.where('party.createdBy = :userId', { userId });
    }

    return query.getMany();
  }

  async findOne(id: number, userId: number, userRole: string): Promise<Party> {
    let query = this.partyRepository
      .createQueryBuilder('party')
      .leftJoinAndSelect('party.creator', 'creator')
      .where('party.id = :id', { id });

    // Agents can only see parties they created
    if (userRole === 'agent') {
      query = query.andWhere('party.createdBy = :userId', { userId });
    }

    const party = await query.getOne();

    if (!party) {
      throw new NotFoundException('Party not found');
    }

    return party;
  }

  async update(
    id: number,
    updatePartyDto: UpdatePartyDto,
    userId: number,
    userRole: string,
  ): Promise<Party> {
    const party = await this.findOne(id, userId, userRole);

    // Check if GST number is being changed and if it already exists
    if (
      'gstNumber' in updatePartyDto &&
      updatePartyDto.gstNumber !== party.gstNumber
    ) {
      const existingParty = await this.partyRepository.findOne({
        where: { gstNumber: updatePartyDto.gstNumber },
      });

      if (existingParty) {
        throw new ConflictException(
          'Party with this GST number already exists',
        );
      }
    }

    Object.assign(party, updatePartyDto);
    return this.partyRepository.save(party);
  }

  async remove(id: number, userId: number, userRole: string): Promise<void> {
    const party = await this.findOne(id, userId, userRole);
    await this.partyRepository.remove(party);
  }

  async searchParties(
    query: string,
    userId: number,
    userRole: string,
  ): Promise<Party[]> {
    let searchQuery = this.partyRepository
      .createQueryBuilder('party')
      .where(
        '(party.name ILIKE :query OR party.gstNumber ILIKE :query OR party.email ILIKE :query)',
        { query: `%${query}%` },
      )
      .orderBy('party.name', 'ASC');

    // Agents can only search parties they created
    if (userRole === 'agent') {
      searchQuery = searchQuery.andWhere('party.createdBy = :userId', {
        userId,
      });
    }

    return searchQuery.getMany();
  }
}
